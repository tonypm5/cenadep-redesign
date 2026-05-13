"""CENADEP backend API tests - covers health, blog, auth, admin CRUD, contact, chat, donations, uploads, tags, scheduling."""
import os
import uuid
import time
import pytest
import requests
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cenadep-blog-demo.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@cenadep.org"
ADMIN_PASSWORD = "Cenadep2026!"


@pytest.fixture(scope="session")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(http):
    r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Health ----------
class TestHealth:
    def test_root(self, http):
        r = http.get(f"{API}/", timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body.get("status") == "ok"
        assert "CENADEP" in body.get("message", "")


# ---------- Blog ----------
class TestBlog:
    def test_list_posts(self, http):
        r = http.get(f"{API}/blog", timeout=15)
        assert r.status_code == 200
        posts = r.json()
        assert isinstance(posts, list)
        assert len(posts) >= 5
        for p in posts:
            assert "_id" not in p
            for k in ("slug", "title_fr", "title_en", "excerpt_fr", "content_fr", "image_url"):
                assert k in p

    def test_get_single_post(self, http):
        r = http.get(f"{API}/blog/construire-democratie-participative-rdc", timeout=15)
        assert r.status_code == 200
        p = r.json()
        assert p["slug"] == "construire-democratie-participative-rdc"
        assert "_id" not in p

    def test_get_missing_post(self, http):
        r = http.get(f"{API}/blog/non-existent-slug-xyz", timeout=15)
        assert r.status_code == 404


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d.get("token_type") == "bearer"
        assert isinstance(d.get("access_token"), str) and len(d["access_token"]) > 20

    def test_login_invalid(self, http):
        r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me_requires_auth(self, http):
        r = http.get(f"{API}/auth/me", timeout=15)
        assert r.status_code in (401, 403)

    def test_me_ok(self, http, auth_headers):
        r = http.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json().get("email") == ADMIN_EMAIL


# ---------- Admin Blog CRUD ----------
class TestAdminBlogCRUD:
    slug = f"test-article-{uuid.uuid4().hex[:8]}"

    def _payload(self, slug=None):
        return {
            "slug": slug or self.slug,
            "title_fr": "TEST Article",
            "title_en": "TEST Article EN",
            "excerpt_fr": "Résumé test",
            "excerpt_en": "Test excerpt",
            "content_fr": "Contenu de test français",
            "content_en": "Test English content",
            "image_url": "https://images.unsplash.com/photo-1573167627769-e201a7ddf409",
            "author": "TEST",
            "tags": ["test"],
        }

    def test_unauth_post_blocked(self, http):
        r = http.post(f"{API}/admin/blog", json=self._payload("unauth-x"), timeout=15)
        assert r.status_code in (401, 403)

    def test_unauth_put_blocked(self, http):
        r = http.put(f"{API}/admin/blog/anything", json=self._payload("anything"), timeout=15)
        assert r.status_code in (401, 403)

    def test_unauth_delete_blocked(self, http):
        r = http.delete(f"{API}/admin/blog/anything", timeout=15)
        assert r.status_code in (401, 403)

    def test_create_update_delete(self, http, auth_headers):
        payload = self._payload()
        # CREATE
        r = http.post(f"{API}/admin/blog", json=payload, headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["slug"] == self.slug

        # GET to verify persistence
        rg = http.get(f"{API}/blog/{self.slug}", timeout=15)
        assert rg.status_code == 200
        assert rg.json()["title_fr"] == "TEST Article"

        # UPDATE
        updated_payload = self._payload()
        updated_payload["title_fr"] = "TEST Article MODIFIE"
        r2 = http.put(f"{API}/admin/blog/{self.slug}", json=updated_payload, headers=auth_headers, timeout=20)
        assert r2.status_code == 200, r2.text
        assert r2.json()["title_fr"] == "TEST Article MODIFIE"

        # Verify update persisted
        rg2 = http.get(f"{API}/blog/{self.slug}", timeout=15)
        assert rg2.json()["title_fr"] == "TEST Article MODIFIE"

        # DELETE
        r3 = http.delete(f"{API}/admin/blog/{self.slug}", headers=auth_headers, timeout=20)
        assert r3.status_code == 200
        assert r3.json().get("deleted") is True

        # Verify deletion
        rg3 = http.get(f"{API}/blog/{self.slug}", timeout=15)
        assert rg3.status_code == 404


# ---------- Contact ----------
class TestContact:
    def test_post_contact(self, http):
        payload = {
            "name": "TEST User",
            "email": "test_user@example.com",
            "subject": "TEST subject",
            "message": "TEST message body",
        }
        r = http.post(f"{API}/contact", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email"] == payload["email"]
        assert "id" in d
        assert "_id" not in d


# ---------- Chat (AI) ----------
class TestChat:
    def test_chat_fr(self, http):
        payload = {
            "session_id": f"test-session-{uuid.uuid4().hex[:8]}",
            "message": "Bonjour, que fait le CENADEP?",
            "lang": "fr",
        }
        r = http.post(f"{API}/chat", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d.get("reply"), str)
        assert len(d["reply"]) > 5


# ---------- Blog AI Summary ----------
class TestBlogSummary:
    def test_summary_fr(self, http):
        r = http.get(f"{API}/blog/construire-democratie-participative-rdc/summary?lang=fr", timeout=90)
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d.get("summary"), str)
        assert len(d["summary"]) > 10


# ---------- Donations ----------
class TestDonations:
    def test_checkout_package(self, http):
        payload = {"package_id": "small", "origin_url": BASE_URL}
        r = http.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("url", "").startswith("http")
        assert isinstance(d.get("session_id"), str) and len(d["session_id"]) > 5
        # status poll
        sid = d["session_id"]
        rs = http.get(f"{API}/donations/status/{sid}", timeout=30)
        assert rs.status_code == 200
        sd = rs.json()
        assert "payment_status" in sd
        assert "status" in sd

    def test_checkout_custom(self, http):
        payload = {"custom_amount": 15.50, "origin_url": BASE_URL}
        r = http.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("url", "").startswith("http")

    def test_checkout_invalid(self, http):
        payload = {"package_id": "doesnotexist", "origin_url": BASE_URL}
        r = http.post(f"{API}/donations/checkout", json=payload, timeout=30)
        assert r.status_code == 400

    def test_status_fallback_unknown_session(self, http):
        # Should NOT 500 even if Stripe can't find the session (fallback)
        sid = f"cs_test_unknown_{uuid.uuid4().hex[:16]}"
        r = http.get(f"{API}/donations/status/{sid}", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("payment_status") in ("pending", "unpaid", "open")
        assert d.get("status") in ("open", "pending")


# ---------- Newsletter (iteration 2) ----------
class TestNewsletter:
    email = f"TEST_news_{uuid.uuid4().hex[:8]}@example.com"
    token_holder = {}

    def test_subscribe_first_time(self, http):
        r = http.post(f"{API}/newsletter/subscribe", json={"email": self.email, "lang": "fr"}, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("ok") is True
        assert d.get("pending_confirmation") is True

    def test_subscribe_idempotent_pending(self, http):
        # Second call before confirm: still pending (regenerates token)
        r = http.post(f"{API}/newsletter/subscribe", json={"email": self.email, "lang": "fr"}, timeout=20)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("ok") is True
        # Either pending_confirmation or already_subscribed depending on state
        assert d.get("pending_confirmation") is True or d.get("already_subscribed") is True

    def test_confirm_invalid_token(self, http):
        r = http.get(f"{API}/newsletter/confirm/totally-invalid-token-xyz", timeout=20, allow_redirects=False)
        assert r.status_code == 404

    def test_admin_list_subscribers_requires_auth(self, http):
        r = http.get(f"{API}/admin/newsletter/subscribers", timeout=15)
        assert r.status_code in (401, 403)

    def test_admin_list_subscribers(self, http, auth_headers):
        r = http.get(f"{API}/admin/newsletter/subscribers", headers=auth_headers, timeout=20)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        emails = [s.get("email") for s in items]
        assert self.email in emails
        # find our subscriber and capture the token for confirm test
        for s in items:
            if s.get("email") == self.email:
                assert "_id" not in s
                assert s.get("confirmed") is False
                TestNewsletter.token_holder["token"] = s.get("confirm_token")
                break
        assert TestNewsletter.token_holder.get("token")

    def test_confirm_valid_token(self, http, auth_headers):
        token = TestNewsletter.token_holder.get("token")
        assert token, "No token captured from previous test"
        r = http.get(f"{API}/newsletter/confirm/{token}", timeout=20, allow_redirects=False)
        # Either 200 ok json OR 307/302 redirect
        assert r.status_code in (200, 302, 307), r.text
        # Verify confirmed=True in admin list
        r2 = http.get(f"{API}/admin/newsletter/subscribers", headers=auth_headers, timeout=20)
        assert r2.status_code == 200
        found = [s for s in r2.json() if s.get("email") == TestNewsletter.email]
        assert found and found[0].get("confirmed") is True

    def test_subscribe_after_confirmed(self, http):
        # After confirmed, subsequent subscribe should return already_subscribed
        r = http.post(f"{API}/newsletter/subscribe", json={"email": self.email, "lang": "fr"}, timeout=20)
        assert r.status_code == 200
        assert r.json().get("already_subscribed") is True

    def test_admin_export_csv_requires_auth(self, http):
        r = http.get(f"{API}/admin/newsletter/export.csv", timeout=15)
        assert r.status_code in (401, 403)

    def test_admin_export_csv(self, http, auth_headers):
        r = http.get(f"{API}/admin/newsletter/export.csv", headers=auth_headers, timeout=20)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        body = r.text
        first_line = body.splitlines()[0]
        assert first_line == "email,lang,confirmed,created_at"
        assert self.email in body


# ---------- Sitemap (iteration 2) ----------
class TestSitemap:
    def test_sitemap_xml(self, http):
        r = http.get(f"{API}/sitemap.xml", timeout=15)
        assert r.status_code == 200
        assert "application/xml" in r.headers.get("content-type", "")
        body = r.text
        assert "<urlset" in body
        assert "<loc>" in body
        assert "/blog/construire-democratie-participative-rdc" in body
        # Static paths
        for p in ("/a-propos", "/programmes", "/blog", "/contact", "/don"):
            assert p in body


# ---------- Contact with empty RESEND key (iteration 2) ----------
class TestContactNoResend:
    def test_contact_still_200_when_resend_empty(self, http):
        # RESEND_API_KEY is intentionally empty — endpoint must still return 200
        r = http.post(f"{API}/contact", json={
            "name": "TEST NoResend",
            "email": "test_noresend@example.com",
            "subject": "TEST graceful no-op",
            "message": "Body",
        }, timeout=20)
        assert r.status_code == 200, r.text
        assert r.json().get("email") == "test_noresend@example.com"


# ---------- Iteration 3: Blog tag filter & tags aggregation ----------
class TestBlogTagsAndFilter:
    def test_tags_aggregation(self, http):
        r = http.get(f"{API}/blog/tags", timeout=15)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert len(items) > 0
        # Validate shape + sorted desc by count
        prev = None
        tags_set = set()
        for it in items:
            assert "tag" in it and "count" in it
            assert isinstance(it["count"], int) and it["count"] >= 1
            tags_set.add(it["tag"])
            if prev is not None:
                assert it["count"] <= prev
            prev = it["count"]
        # Seed contains 'jeunesse' tag
        assert "jeunesse" in tags_set

    def test_blog_filter_by_tag(self, http):
        r = http.get(f"{API}/blog?tag=jeunesse", timeout=15)
        assert r.status_code == 200, r.text
        posts = r.json()
        assert isinstance(posts, list)
        assert len(posts) >= 1
        for p in posts:
            assert "jeunesse" in p.get("tags", [])

    def test_blog_filter_unknown_tag(self, http):
        r = http.get(f"{API}/blog?tag=nonexistent-tag-xyz", timeout=15)
        assert r.status_code == 200
        assert r.json() == []

    def test_blog_list_returns_all_without_tag(self, http):
        r = http.get(f"{API}/blog", timeout=15)
        assert r.status_code == 200
        assert len(r.json()) >= 5


# ---------- Iteration 3: Article scheduling (future published_at) ----------
class TestArticleScheduling:
    def test_future_post_hidden_from_public_list(self, http, auth_headers):
        slug = f"test-future-{uuid.uuid4().hex[:8]}"
        future_dt = "2030-01-01T00:00:00+00:00"
        payload = {
            "slug": slug,
            "title_fr": "TEST Future",
            "title_en": "TEST Future EN",
            "excerpt_fr": "Futur",
            "excerpt_en": "Future",
            "content_fr": "Contenu futur",
            "content_en": "Future content",
            "image_url": "https://images.unsplash.com/photo-1573167627769-e201a7ddf409",
            "author": "TEST",
            "tags": ["test-future"],
            "published_at": future_dt,
        }
        try:
            r = http.post(f"{API}/admin/blog", json=payload, headers=auth_headers, timeout=20)
            assert r.status_code == 200, r.text
            created = r.json()
            assert created["slug"] == slug

            # Public list MUST NOT include this future post
            rl = http.get(f"{API}/blog", timeout=15)
            assert rl.status_code == 200
            slugs = [p["slug"] for p in rl.json()]
            assert slug not in slugs, f"Future-scheduled slug {slug} unexpectedly returned in public list"

            # Filter by its tag also must not return it
            rt = http.get(f"{API}/blog?tag=test-future", timeout=15)
            assert rt.status_code == 200
            assert slug not in [p["slug"] for p in rt.json()]

            # Tag aggregation should also exclude it
            rtag = http.get(f"{API}/blog/tags", timeout=15)
            assert "test-future" not in [t["tag"] for t in rtag.json()]
        finally:
            # Cleanup
            http.delete(f"{API}/admin/blog/{slug}", headers=auth_headers, timeout=15)


# ---------- Iteration 3: Admin image upload + public file serve ----------
class TestUploads:
    uploaded_path = {}

    def test_upload_requires_auth(self):
        # No auth header — use plain requests (NOT the shared json-session)
        files = {"file": ("x.jpg", b"\xff\xd8\xff\xe0fake", "image/jpeg")}
        r = requests.post(f"{API}/admin/upload", files=files, timeout=30)
        assert r.status_code in (401, 403)

    def test_upload_rejects_bad_content_type(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        files = {"file": ("notes.txt", b"hello world", "text/plain")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=headers, timeout=30)
        assert r.status_code == 400, r.text

    def test_upload_jpeg_success(self, token):
        headers = {"Authorization": f"Bearer {token}"}
        # Read existing jpeg from public/brand
        local = "/app/frontend/public/brand/cenadep-favicon.jpg"
        with open(local, "rb") as fh:
            data = fh.read()
        files = {"file": ("favicon.jpg", data, "image/jpeg")}
        r = requests.post(f"{API}/admin/upload", files=files, headers=headers, timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "path" in d and isinstance(d["path"], str) and len(d["path"]) > 5
        assert d.get("url", "").startswith("/api/files/")
        assert d.get("content_type") == "image/jpeg"
        assert isinstance(d.get("size"), int) and d["size"] > 0
        TestUploads.uploaded_path["path"] = d["path"]
        TestUploads.uploaded_path["url"] = d["url"]
        TestUploads.uploaded_path["size"] = d["size"]

    def test_files_serve_returns_image(self, http):
        path = TestUploads.uploaded_path.get("path")
        if not path:
            pytest.skip("Upload didn't succeed; skipping serve test")
        # Use the full url with /api prefix
        r = http.get(f"{BASE_URL}/api/files/{path}", timeout=60)
        assert r.status_code == 200, r.text
        assert r.headers.get("content-type", "").startswith("image/jpeg")
        assert len(r.content) > 0

    def test_files_serve_unknown_404(self, http):
        r = http.get(f"{BASE_URL}/api/files/cenadep/uploads/does-not-exist-xyz.jpg", timeout=30)
        assert r.status_code == 404
