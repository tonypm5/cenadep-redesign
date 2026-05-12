"""CENADEP backend API tests - covers health, blog, auth, admin CRUD, contact, chat, donations."""
import os
import uuid
import time
import pytest
import requests

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
