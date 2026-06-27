"""Backend auth endpoint tests for CareerVerse (register, login, /me)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read frontend/.env directly
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.strip().split("=", 1)[1].rstrip("/")
                    break

API = f"{BASE_URL}/api"

SEED_EMAIL = "test.student@careerverse.io"
SEED_PASSWORD = "Test@1234"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def fresh_email():
    return f"qa+{int(time.time())}@careerverse.io"


# ---------- /api/auth/register ----------
class TestRegister:
    def test_register_new_user_success(self, session, fresh_email):
        r = session.post(f"{API}/auth/register", json={
            "name": "QA New User",
            "email": fresh_email,
            "password": "Strong@Pass1",
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and isinstance(body["token"], str) and len(body["token"]) > 20
        assert "user" in body
        u = body["user"]
        assert u["email"] == fresh_email
        assert u["name"] == "QA New User"
        assert "id" in u and isinstance(u["id"], str)
        assert "createdAt" in u and isinstance(u["createdAt"], str)
        pytest.shared_new_user = {"email": fresh_email, "password": "Strong@Pass1",
                                  "token": body["token"], "id": u["id"]}

    def test_register_duplicate_email_returns_409(self, session, fresh_email):
        r = session.post(f"{API}/auth/register", json={
            "name": "Dup",
            "email": fresh_email,
            "password": "Strong@Pass1",
        })
        assert r.status_code == 409, r.text

    def test_register_short_password_returns_422(self, session):
        r = session.post(f"{API}/auth/register", json={
            "name": "Short PW",
            "email": f"qa+short{int(time.time())}@careerverse.io",
            "password": "abc",  # < 8 chars
        })
        assert r.status_code == 422, r.text

    def test_register_invalid_email_returns_422(self, session):
        r = session.post(f"{API}/auth/register", json={
            "name": "Bad Email",
            "email": "not-an-email",
            "password": "Strong@Pass1",
        })
        assert r.status_code == 422, r.text


# ---------- /api/auth/login ----------
class TestLogin:
    def test_login_seeded_user_success(self, session):
        r = session.post(f"{API}/auth/login", json={
            "email": SEED_EMAIL, "password": SEED_PASSWORD,
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and len(body["token"]) > 20
        assert body["user"]["email"] == SEED_EMAIL
        assert "id" in body["user"]
        pytest.seed_token = body["token"]
        pytest.seed_user_id = body["user"]["id"]

    def test_login_wrong_password_returns_401(self, session):
        r = session.post(f"{API}/auth/login", json={
            "email": SEED_EMAIL, "password": "WrongPass!9",
        })
        assert r.status_code == 401, r.text
        assert r.json().get("detail") == "Invalid email or password"

    def test_login_unknown_email_returns_401(self, session):
        r = session.post(f"{API}/auth/login", json={
            "email": f"unknown+{int(time.time())}@careerverse.io",
            "password": "AnyPass@1",
        })
        assert r.status_code == 401, r.text
        assert r.json().get("detail") == "Invalid email or password"


# ---------- /api/auth/me ----------
class TestMe:
    def test_me_without_auth_header_returns_401(self, session):
        # bypass module-level header by using a clean call
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401, r.text

    def test_me_with_malformed_token_returns_401(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Bearer garbage.token.value"})
        assert r.status_code == 401, r.text

    def test_me_with_non_bearer_returns_401(self):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": "Basic abcd"})
        assert r.status_code == 401, r.text

    def test_me_with_valid_token_returns_user(self):
        token = getattr(pytest, "seed_token", None)
        if not token:
            pytest.skip("seed login token unavailable")
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["email"] == SEED_EMAIL
        assert body["id"] == pytest.seed_user_id
        assert "name" in body and "createdAt" in body
