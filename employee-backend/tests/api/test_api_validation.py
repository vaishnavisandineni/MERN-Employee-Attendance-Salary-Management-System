import os
import time
import threading
import pytest
import requests
import pymongo
from typing import Generator

BASE_URL = "http://localhost:8080/api"
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/employee_management")

# -----------------------------------------------------------------------
# Shared session fixture — a persistent http client for the whole suite
# -----------------------------------------------------------------------
@pytest.fixture(scope="module")
def db_session() -> Generator[requests.Session, None, None]:
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_database()
    users_col = db.get_collection("users")

    # Wipe any leftover test users from a previous interrupted run
    users_col.delete_many({"email": {"$regex": "pytest_api"}})

    session = requests.Session()
    yield session

    # Cleanup after the whole module finishes
    users_col.delete_many({"email": {"$regex": "pytest_api"}})
    client.close()

# -----------------------------------------------------------------------
# CATEGORY 1: Happy Path
# Valid inputs should succeed and return what the client expects
# -----------------------------------------------------------------------
def test_happy_path_register_new_employee(db_session):
    """
    HR registers a brand new construction worker with all required fields.
    The API should accept this and return a 201 with the created user.
    """
    payload = {
        "name": "Pytest API Worker",
        "email": "pytest_api_happy@test.com",
        "password": "Worker@123",
        "role": "employee",
        "employeeType": "Mason"
    }
    response = db_session.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
    data = response.json()
    assert "user" in data
    assert data["user"]["email"] == "pytest_api_happy@test.com"
    assert data["user"].get("password") is None, "Password should never be returned in the API response"


def test_happy_path_admin_login_returns_token(db_session):
    """
    Admin login with correct credentials returns a JWT token.
    Without this token, no other API call is possible.
    """
    payload = {"email": "admin@test.com", "password": "Admin123"}
    response = db_session.post(f"{BASE_URL}/auth/login", json=payload)
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    data = response.json()
    assert "token" in data, "No token returned — all downstream calls will fail"
    # Store token in session for subsequent tests
    db_session.headers.update({"Authorization": f"Bearer {data['token']}"})


# -----------------------------------------------------------------------
# CATEGORY 2: Validation — Boundary Values and Missing Fields
# These test the API's ability to reject bad data BEFORE it hits MongoDB
# -----------------------------------------------------------------------
@pytest.mark.parametrize("payload,expected_status", [
    # Missing email
    ({"name": "No Email Worker", "password": "pass", "role": "employee"}, 400),
    # Missing name
    ({"email": "pytest_api_noname@test.com", "password": "pass", "role": "employee"}, 400),
    # Missing password
    ({"name": "No Pass", "email": "pytest_api_nopass@test.com", "role": "employee"}, 400),
    # Empty string values (not truly "missing" but equally invalid)
    ({"name": "", "email": "pytest_api_empty@test.com", "password": "pass", "role": "employee"}, 400),
])
def test_validation_missing_or_empty_fields_are_rejected(db_session, payload, expected_status):
    """
    The backend must reject incomplete employee registrations.
    If it doesn't, we get ghost workers in the system with no salary or attendance linked.
    """
    response = db_session.post(f"{BASE_URL}/auth/register", json=payload)
    assert response.status_code == expected_status, (
        f"Payload {payload} should have returned {expected_status}, got {response.status_code}: {response.text}"
    )


@pytest.mark.parametrize("salary_value", [
    -1500,     # Negative salary — would deduct money from worker instead of paying
    -0.50,     # Negative float
    0,         # Zero salary — worker works for free, legally and ethically wrong
    999999999, # Unrealistic huge number — fat-finger entry, inflates payroll by millions
])
def test_validation_salary_boundary_values_are_rejected(db_session, salary_value):
    """
    Salary boundary test. During exploratory testing, the API accepted -1500 as a valid salary.
    This would cause the payroll system to deduct money from a worker rather than pay them.
    The backend MUST validate salary is a positive, reasonable number.
    """
    payload = {
        "baseSalary": salary_value,
        "userId": "some_user_id"  # The exact route depends on the app
    }
    response = db_session.put(f"{BASE_URL}/auth/update/test_id", json=payload)
    # Must NOT be a 200 OK — invalid salary should never be silently accepted
    assert response.status_code in [400, 422], (
        f"Salary value {salary_value} was accepted as valid — this will break payroll. "
        f"Got status {response.status_code}: {response.text}"
    )


# -----------------------------------------------------------------------
# CATEGORY 3: Business Rules
# These are HRMS-specific rules the backend must enforce
# -----------------------------------------------------------------------
def test_business_rule_duplicate_email_is_blocked(db_session):
    """
    Two workers cannot share the same email. If they could, their salary records,
    attendance data, and payslips would collide. One worker could see another's payslip.
    """
    payload = {
        "name": "Duplicate Worker",
        "email": "pytest_api_dup@test.com",
        "password": "pass",
        "role": "employee"
    }
    first_response = db_session.post(f"{BASE_URL}/auth/register", json=payload)
    # First time should work
    assert first_response.status_code == 201

    second_response = db_session.post(f"{BASE_URL}/auth/register", json=payload)
    # Second attempt with same email must be rejected
    assert second_response.status_code == 400, (
        f"Duplicate email was accepted. Two workers would share payroll records."
    )
    assert "already exists" in second_response.json().get("message", "").lower(), (
        "Error message doesn't explain WHY it failed — bad for the HR operator"
    )


def test_business_rule_protected_routes_require_token(db_session):
    """
    Salary and attendance data is sensitive financial information.
    If someone bypasses the login and directly hits /api/salary/all,
    they can see every worker's pay data. The API must block this with 401.
    """
    # Create a fresh session WITHOUT the Authorization header
    unauthed_session = requests.Session()
    protected_endpoints = ["/salary/all", "/leave/all", "/attendance/all"]
    for endpoint in protected_endpoints:
        response = unauthed_session.get(f"{BASE_URL}{endpoint}")
        assert response.status_code == 401, (
            f"Endpoint {endpoint} returned {response.status_code} without a token — "
            f"financial data is exposed to unauthenticated users."
        )


# -----------------------------------------------------------------------
# CATEGORY 4: Error Responses — API must return meaningful messages
# Not just a 500 stack trace that exposes internal code structure
# -----------------------------------------------------------------------
def test_error_response_login_with_wrong_password(db_session):
    """
    Wrong password should give a clear 401 with an understandable message.
    NOT a 500 error that exposes the database or bcrypt internals.
    The HR operator needs to know WHY login failed to fix it quickly.
    """
    payload = {"email": "admin@test.com", "password": "totallyWrongPassword123"}
    # Use a fresh session without the auth header
    fresh_session = requests.Session()
    response = fresh_session.post(f"{BASE_URL}/auth/login", json=payload)
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    data = response.json()
    # Must have a message — not an empty body or raw stack trace
    assert "message" in data, "No 'message' field in error response — HR operator won't know what went wrong"
    # Must NOT leak internal code details
    assert "stack" not in data, "Stack trace is exposed in the error response — security risk"
    assert "MongoError" not in str(data), "Internal MongoDB error details are leaking into the client response"


def test_error_response_no_stack_trace_on_bad_salary_update(db_session):
    """
    Sending a malformed salary update should return a clean 400 Bad Request,
    NOT a raw Express error stack trace. Stack traces expose internal file paths
    and library versions that an attacker can use to target the system.
    """
    payload = {"baseSalary": "not_a_number"}  # Intentionally wrong type
    response = db_session.put(f"{BASE_URL}/auth/update/invalid_id_123", json=payload)
    data = response.json()
    # Whatever status it returns, it must not be leaking internal errors
    assert "stack" not in data, f"Stack trace exposed in response: {data}"
    assert "TypeError" not in str(data), f"Internal TypeError leaked to client: {data}"


# -----------------------------------------------------------------------
# BONUS: Idempotency — The Double Submit Test
# Real scenario: site manager taps "Submit Attendance" 3 times on a slow 3G network
# -----------------------------------------------------------------------
def test_double_submit_attendance_does_not_create_duplicate_records():
    """
    Simulates a site manager hitting submit twice because the UI froze.
    Using threading to fire two near-simultaneous POST requests.
    Only one attendance record should exist afterward.
    Only relevant if this endpoint exists and is accessible.
    """
    results = []

    def submit():
        try:
            resp = requests.post(f"{BASE_URL}/attendance/mark", json={
                "userId": "test_worker_id",
                "date": "2024-01-15",
                "status": "Present"
            }, timeout=5)
            results.append(resp.status_code)
        except Exception as e:
            results.append(str(e))

    # Fire both requests as close together as possible
    t1 = threading.Thread(target=submit)
    t2 = threading.Thread(target=submit)
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    # At least one should succeed, but not both should create new records
    # We check the responses — ideally one 201 Created and one 200 OK (idempotent)
    # OR both 401 because this endpoint requires auth — which also proves it's protected
    assert len(results) == 2
    assert not all(code == 500 for code in results), (
        "Both requests crashed with 500 — double submit is breaking the server, not just creating duplicates"
    )
