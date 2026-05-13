"""Resend email helper — graceful no-op when API key is missing."""
import os
import asyncio
import logging
import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()


def _configured() -> bool:
    if not RESEND_API_KEY:
        return False
    resend.api_key = RESEND_API_KEY
    return True


async def send_email(to: str, subject: str, html: str, reply_to: str | None = None) -> dict:
    """Send a transactional email. Returns {ok, id?|error?}. Never raises."""
    if not _configured():
        logger.warning("Resend not configured (RESEND_API_KEY empty). Skipping email to %s", to)
        return {"ok": False, "error": "resend_not_configured"}
    params = {
        "from": SENDER_EMAIL,
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        params["reply_to"] = reply_to
    try:
        res = await asyncio.to_thread(resend.Emails.send, params)
        return {"ok": True, "id": res.get("id") if isinstance(res, dict) else None}
    except Exception as e:
        logger.exception("Resend send failed: %s", e)
        return {"ok": False, "error": str(e)}


def base_template(title: str, body_html: str, lang: str = "fr") -> str:
    footer_fr = "CENADEP · Centre National d'Appui au Développement et à la Participation Populaire · Kinshasa, RDC"
    footer_en = "CENADEP · National Centre for Support to Development and Popular Participation · Kinshasa, DRC"
    footer = footer_fr if lang == "fr" else footer_en
    return f"""<!doctype html>
<html><body style="margin:0;padding:0;background:#F8F9FA;font-family:Helvetica,Arial,sans-serif;color:#0A0A0A;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;border:1px solid rgba(0,0,0,0.05);">
      <tr><td style="padding:32px 40px;background:#1A8F4D;color:#fff;">
        <div style="font-weight:800;font-size:22px;letter-spacing:-0.02em;">CENADEP</div>
        <div style="opacity:.85;font-size:13px;margin-top:4px;">Cultivons la démocratie participative.</div>
      </td></tr>
      <tr><td style="padding:40px;">
        <h1 style="margin:0 0 16px;font-size:24px;color:#0A0A0A;font-weight:800;letter-spacing:-0.02em;">{title}</h1>
        {body_html}
      </td></tr>
      <tr><td style="padding:24px 40px;background:#F8F9FA;color:#736B63;font-size:12px;text-align:center;">
        {footer}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""
