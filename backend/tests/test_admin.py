"""Backend regression tests for Admin Panel endpoints (CareerVerse).

Covers:
- Auth gating (401 / 403)
- /api/admin/users (list, search, include_deleted)
- /api/admin/users/{uid} (detail, 404)
- /api/admin/users/{uid}/ban (ban/unban, login-after-ban, self/admin guards)
- /api/admin/users/{uid} DELETE (soft delete + login blocked + self/admin guards)
- /api/admin/stats
"""
import os
import time
import uuid
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load backend .env so tests don't depend on shell env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
# Read backend URL from frontend .env (single source of truth in this app)
FRONTEND_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
for line in FRONTEND_ENV.read_text().splitlines():
    if line.startswith("REACT_APP_BACKEND_URL="):
        os.environ["REACT_APP_BACKEND_URL"] = line.split("=", 1)[1].strip()

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@careerverse.io"
ADMIN_PASSWORD = "Admin@1234"
USER_EMAIL = "test.student@careerverse.io"
USER_PASSWORD = "Test@1234"


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=20)
    return r


@pytest.fixture(scope="session")
def admin_token():
    r = _login(ADMIN_EMAIL, ADMIN_PASSWORD)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"], data["user"]["id"]


@pytest.fixture(scope="session")
def user_token():
    # Ensure test user exists
    r = _login(USER_EMAIL, USER_PASSWORD)
    if r.status_code != 200:
        # Try to register
        rr = requests.post(f"{API}/auth/register", json={
            "name": "Test Student", "email": USER_EMAIL, "password": USER_PASSWORD,
        }, timeout=20)
        assert rr.status_code in (200, 201, 409), f"Setup failed: {rr.text}"
        r = _login(USER_EMAIL, USER_PASSWORD)
    assert r.status_code == 200, f"User login failed: {r.text}"
    return r.json()["token"], r.json()["user"]["id"]


@pytest.fixture()
def throwaway_user():
    """Create a fresh non-admin user that tests can mutate."""
    email = f"qa.admin.{int(time.time()*1000)}.{uuid.uuid4().hex[:6]}@careerverse.io"
    pw = "Qatest@1234"
    rr = requests.post(f"{API}/auth/register", json={
        "name": "QA Admin Subject", "email": email, "password": pw,
    }, timeout=20)
    assert rr.status_code == 200, rr.text
    body = rr.json()
    yield {"id": body["user"]["id"], "email": email, "password": pw, "token": body["token"]}


def _h(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Auth gating ----------
class TestAdminAuthGating:
    def test_users_list_no_token_401(self):
        r = requests.get(f"{API}/admin/users", timeout=20)
        assert r.status_code == 401

    def test_users_list_non_admin_403(self, user_token):
        token, _ = user_token
        r = requests.get(f"{API}/admin/users", headers=_h(token), timeout=20)
        assert r.status_code == 403
        assert r.json().get("detail") == "Admin access required"

    def test_stats_no_token_401(self):
        r = requests.get(f"{API}/admin/stats", timeout=20)
        assert r.status_code == 401

    def test_stats_non_admin_403(self, user_token):
        token, _ = user_token
        r = requests.get(f"{API}/admin/stats", headers=_h(token), timeout=20)
        assert r.status_code == 403

    def test_bad_token_401(self):
        r = requests.get(f"{API}/admin/users", headers=_h("not-a-real-token"), timeout=20)
        assert r.status_code == 401


# ---------- List + search ----------
class TestAdminUsersList:
    def test_list_users_admin_200(self, admin_token):
        token, _ = admin_token
        r = requests.get(f"{API}/admin/users", headers=_h(token), timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "users" in data and "total" in data
        assert isinstance(data["users"], list)
        assert data["total"] == len(data["users"])
        if data["users"]:
            u = data["users"][0]
            for k in ("id", "name", "email", "role", "createdAt", "lastLoginAt",
                      "bannedAt", "deletedAt", "mentorSessionCount"):
                assert k in u, f"missing key {k}"
            assert isinstance(u["mentorSessionCount"], int)

    def test_list_users_search_q(self, admin_token):
        token, _ = admin_token
        r = requests.get(f"{API}/admin/users?q=test", headers=_h(token), timeout=20)
        assert r.status_code == 200
        users = r.json()["users"]
        # Each row must contain 'test' in name or email (case-insensitive)
        for u in users:
            assert ("test" in u["name"].lower()) or ("test" in u["email"].lower())

    def test_list_users_search_no_match(self, admin_token):
        token, _ = admin_token
        r = requests.get(f"{API}/admin/users?q=zzz-no-match-zzz", headers=_h(token), timeout=20)
        assert r.status_code == 200
        assert r.json()["users"] == []
        assert r.json()["total"] == 0

    def test_list_users_include_deleted(self, admin_token, throwaway_user):
        token, admin_id = admin_token
        # Soft-delete the throwaway user
        d = requests.delete(f"{API}/admin/users/{throwaway_user['id']}",
                            headers=_h(token), timeout=20)
        assert d.status_code == 200
        # default list omits deleted
        r1 = requests.get(f"{API}/admin/users", headers=_h(token), timeout=20)
        ids_default = [u["id"] for u in r1.json()["users"]]
        assert throwaway_user["id"] not in ids_default
        # include_deleted=true shows them
        r2 = requests.get(f"{API}/admin/users?include_deleted=true",
                          headers=_h(token), timeout=20)
        ids_all = [u["id"] for u in r2.json()["users"]]
        assert throwaway_user["id"] in ids_all
        target = next(u for u in r2.json()["users"] if u["id"] == throwaway_user["id"])
        assert target["deletedAt"] is not None


# ---------- Detail ----------
class TestAdminUserDetail:
    def test_detail_ok(self, admin_token):
        token, admin_id = admin_token
        r = requests.get(f"{API}/admin/users/{admin_id}", headers=_h(token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == admin_id
        assert "recentSessions" in d
        assert "mentorMessageCount" in d
        assert isinstance(d["recentSessions"], list)
        assert isinstance(d["mentorMessageCount"], int)

    def test_detail_404(self, admin_token):
        token, _ = admin_token
        r = requests.get(f"{API}/admin/users/does-not-exist-xyz",
                         headers=_h(token), timeout=20)
        assert r.status_code == 404


# ---------- Ban / Unban ----------
class TestAdminBan:
    def test_ban_then_unban_login_cycle(self, admin_token, throwaway_user):
        token, _ = admin_token
        uid = throwaway_user["id"]
        # Ban
        r = requests.patch(f"{API}/admin/users/{uid}/ban",
                           headers=_h(token), json={"banned": True}, timeout=20)
        assert r.status_code == 200
        assert r.json()["bannedAt"] is not None
        # Login should now fail with 403
        lr = _login(throwaway_user["email"], throwaway_user["password"])
        assert lr.status_code == 403
        # Unban
        r = requests.patch(f"{API}/admin/users/{uid}/ban",
                           headers=_h(token), json={"banned": False}, timeout=20)
        assert r.status_code == 200
        assert r.json()["bannedAt"] is None
        # Login should succeed again
        lr2 = _login(throwaway_user["email"], throwaway_user["password"])
        assert lr2.status_code == 200

    def test_admin_cannot_ban_self(self, admin_token):
        token, admin_id = admin_token
        r = requests.patch(f"{API}/admin/users/{admin_id}/ban",
                           headers=_h(token), json={"banned": True}, timeout=20)
        assert r.status_code == 400
        assert "themselves" in r.json().get("detail", "").lower()


# ---------- Soft delete ----------
class TestAdminSoftDelete:
    def test_delete_user_blocks_login_and_me(self, admin_token, throwaway_user):
        token, _ = admin_token
        uid = throwaway_user["id"]
        r = requests.delete(f"{API}/admin/users/{uid}", headers=_h(token), timeout=20)
        assert r.status_code == 200
        assert r.json()["deletedAt"] is not None
        # Login of deleted user → 401 (per backend semantics)
        lr = _login(throwaway_user["email"], throwaway_user["password"])
        assert lr.status_code == 401
        # /auth/me with old token → 401
        me = requests.get(f"{API}/auth/me",
                          headers=_h(throwaway_user["token"]), timeout=20)
        assert me.status_code == 401

    def test_admin_cannot_delete_self(self, admin_token):
        token, admin_id = admin_token
        r = requests.delete(f"{API}/admin/users/{admin_id}",
                            headers=_h(token), timeout=20)
        assert r.status_code == 400


# ---------- Stats ----------
class TestAdminStats:
    def test_stats_admin(self, admin_token):
        token, _ = admin_token
        r = requests.get(f"{API}/admin/stats", headers=_h(token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ("totalUsers", "deletedUsers", "bannedUsers",
                  "adminCount", "mentorSessions", "mentorMessages"):
            assert k in d
            assert isinstance(d[k], int)
        assert d["adminCount"] >= 1
