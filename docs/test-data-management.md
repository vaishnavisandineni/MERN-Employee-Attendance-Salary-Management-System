# Test Data Management

## Why This Matters

Tests that need you to manually log in, create an employee, and set up data before running are useless in a CI pipeline. If a teammate clones this repo and runs the tests for the first time, they should work on the first try. This document explains how we handle that.

---

## 1. Seed Data Scripts — Known Starting State

### Script: `employee-backend/scripts/seed.js`
This is the primary seed script that creates 21 employees (including 1 admin) in MongoDB with realistic construction-industry roles. It must be run before any test suite that depends on existing user data.

**Run it with:**
```bash
cd employee-backend
node scripts/seed.js
```

The seed creates:
- 1 Admin user: `admin@test.com` / `Admin123`
- 20 Worker employees with roles like Mason, Carpenter, Electrician, Safety Officer, etc.
- Corresponding Salary records so the Salary API has real data to query

### Script: `employee-backend/scripts/seedAttendanceSmart.js`
Seeds realistic attendance records for the current month. Without this, all salary calculations return zero and tests that verify payslip math will fail.

**Run it with:**
```bash
node scripts/seedAttendanceSmart.js
```

### Fixture File: `tests/fixtures/seed.json`
A static snapshot of all 21 seeded employees in JSON format. Used by Pytest tests to look up valid user IDs and email addresses without hitting the database every time. This makes the Python tests faster and more predictable.

---

## 2. Cleanup Between Test Runs

### In Python (Pytest)
The `db_session` fixture in `tests/api/test_api_validation.py` handles this automatically.

```python
@pytest.fixture(scope="module")
def db_session():
    client = pymongo.MongoClient(MONGO_URI)
    db = client.get_database()
    users_col = db.get_collection("users")

    # Before tests: delete any leftover "pytest_api" test users
    users_col.delete_many({"email": {"$regex": "pytest_api"}})
    
    session = requests.Session()
    yield session
    
    # After tests: clean up everything the tests created
    users_col.delete_many({"email": {"$regex": "pytest_api"}})
    client.close()
```

**How it works:** 
All test user emails use the `pytest_api_` prefix (e.g. `pytest_api_happy@test.com`). The cleanup regex `{"$regex": "pytest_api"}` ensures ONLY test-created records are deleted, never touching the real seeded employees like `admin@test.com`.

### In JavaScript (Jest)
Regression and smoke tests in `tests/regression/` and `tests/smoke/` use `beforeAll` / `afterAll` hooks to either use the seeded data directly (read-only tests) or create their own isolated records with a `jest_test_` prefix.

---

## 3. Factory Pattern for Complex Test Setup

For the E2E Playwright tests (`tests/e2e/e2e-flows.spec.js`), creating an employee requires multiple fields. Instead of duplicating the payload in every test, we use a single factory function at the top of the spec file:

```javascript
// If we needed a factory, it would look like this:
function createWorkerPayload(overrides = {}) {
  return {
    name: "E2E Raju Prasad",
    email: "e2e_raju@construction.com",
    password: "Worker@123",
    role: "employee",
    baseSalary: "750",
    ...overrides  // Lets individual tests override just one field
  };
}

// Usage: test a worker with a specific salary
// createWorkerPayload({ baseSalary: "1200" })
```

This pattern is the same concept I used in the SQL Data Guard tests where we had complex query payload structures that needed slight variations between test cases, but shared most of the same structure.

---

## Running the Full Test Stack in Order

To run everything from a clean state:

```bash
# Step 1: Seed the database
cd employee-backend
node scripts/seed.js
node scripts/seedAttendanceSmart.js

# Step 2: Start the backend server
node server.js &

# Step 3: Run smoke tests (< 30 seconds)
npm run test tests/smoke/smoke.test.js

# Step 4: Run regression tests
npm run test tests/regression/

# Step 5: Run Pytest API tests
pip install -r requirements.txt
pytest tests/api/ -v

# Step 6: Run E2E tests (requires frontend to be running too)
# cd ../employee-frontend && npm start &
npx playwright test tests/e2e/
```
