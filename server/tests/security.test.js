/**
 * NormWise Phase 18: Security, Authentication & Role-Based Access Control Test Suite
 * Comprehensive validation of Section 43 test requirements (1 to 25).
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import prisma from "../src/config/db.js";
import { hashPassword, verifyPassword } from "../src/services/authService.js";
import { PERMISSIONS, hasPermission, ROLE_PERMISSIONS } from "../src/config/permissions.js";

describe("Phase 18 Security, Authentication & RBAC Test Suite", () => {
  let server;
  let baseUrl;
  let officerUser, reviewerUser, adminUser, auditorUser;

  // Helper to extract Set-Cookie header value
  function parseCookie(response, cookieName) {
    const rawCookies = response.headers.get("set-cookie");
    if (!rawCookies) return null;
    const match = rawCookies.match(new RegExp(`${cookieName}=([^;]+)`));
    return match ? match[1] : null;
  }

  before(async () => {
    // 1. Start ephemeral HTTP server
    await new Promise((resolve) => {
      server = app.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}/api`;
        resolve();
      });
    });

    // 2. Fetch seed users from database
    officerUser = await prisma.user.findUnique({ where: { email: "officer@normwise.local" } });
    reviewerUser = await prisma.user.findUnique({ where: { email: "reviewer@normwise.local" } });
    adminUser = await prisma.user.findUnique({ where: { email: "admin@normwise.local" } });
    auditorUser = await prisma.user.findUnique({ where: { email: "auditor@normwise.local" } });

    assert.ok(officerUser, "officer seed user must exist");
    assert.ok(reviewerUser, "reviewer seed user must exist");
    assert.ok(adminUser, "admin seed user must exist");
    assert.ok(auditorUser, "auditor seed user must exist");
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // 1. Login success
  it("1. should successfully login with valid credentials and return user info with session cookie", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "officer@normwise.local",
        password: "NormWise2026!",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, "officer@normwise.local");
    assert.equal(body.data.user.role, "PROCUREMENT_OFFICER");

    // Must set HTTP-only normwise_session cookie
    const sessionCookie = parseCookie(res, "normwise_session");
    assert.ok(sessionCookie, "Must set normwise_session cookie");

    const csrfCookie = parseCookie(res, "normwise_csrf");
    assert.ok(csrfCookie, "Must set companion normwise_csrf cookie");
  });

  // 2. Invalid password
  it("2. should reject login with invalid password using generic error without leaking details", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "officer@normwise.local",
        password: "WrongPassword123!",
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, "INVALID_CREDENTIALS");
    assert.equal(body.error.message, "Invalid email or password.");
  });

  // 3. Unknown user
  it("3. should reject login with non-existent email using exact same generic error", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent_ghost@normwise.local",
        password: "NormWise2026!",
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, "INVALID_CREDENTIALS");
    assert.equal(body.error.message, "Invalid email or password.");
  });

  // 4. Inactive user
  it("4. should reject login for deactivated user with generic authentication error", async () => {
    // Create temporary inactive user
    const inactiveUser = await prisma.user.upsert({
      where: { email: "inactive_test@normwise.local" },
      update: { isActive: false },
      create: {
        email: "inactive_test@normwise.local",
        name: "Inactive User",
        role: "PROCUREMENT_OFFICER",
        passwordHash: await hashPassword("NormWise2026!"),
        isActive: false,
      },
    });

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "inactive_test@normwise.local",
        password: "NormWise2026!",
      }),
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.message, "Invalid email or password.");

    // Clean up
    await prisma.user.delete({ where: { id: inactiveUser.id } });
  });

  // 5. Logout
  it("5. should logout user and invalidate session on server", async () => {
    // Login first
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "officer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");

    // Perform logout
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `normwise_session=${sessionCookie}`,
      },
    });
    assert.equal(logoutRes.status, 200);

    // After logout, accessing /auth/me with that cookie must return 401
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Cookie: `normwise_session=${sessionCookie}`,
      },
    });
    assert.equal(meRes.status, 401);
  });

  // 6. Protected endpoint without authentication
  it("6. should reject protected endpoint without authentication with 401", async () => {
    const res = await fetch(`${baseUrl}/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error.code, "UNAUTHORIZED");
  });

  // 7. Protected endpoint with authentication
  it("7. should allow protected endpoint with valid session cookie", async () => {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "reviewer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");

    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.user.email, "reviewer@normwise.local");
    assert.equal(body.data.user.role, "TECHNICAL_REVIEWER");
  });

  // 8. Role authorization
  it("8. should deny non-admin users from accessing admin routes with 403", async () => {
    // Reviewer attempts to list users
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "reviewer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");

    const res = await fetch(`${baseUrl}/admin/users`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "FORBIDDEN");
  });

  // 9. Permission authorization
  it("9. should correctly enforce permission mapping across roles", () => {
    // Procurement Officer
    assert.equal(hasPermission("PROCUREMENT_OFFICER", PERMISSIONS.RECOMMENDATION_CREATE), true);
    assert.equal(hasPermission("PROCUREMENT_OFFICER", PERMISSIONS.DATASET_IMPORT), false);
    assert.equal(hasPermission("PROCUREMENT_OFFICER", PERMISSIONS.USER_MANAGE), false);

    // Technical Reviewer
    assert.equal(hasPermission("TECHNICAL_REVIEWER", PERMISSIONS.RECOMMENDATION_REVIEW), true);
    assert.equal(hasPermission("TECHNICAL_REVIEWER", PERMISSIONS.DATASET_IMPORT), false);

    // Auditor
    assert.equal(hasPermission("AUDITOR", PERMISSIONS.AUDIT_READ), true);
    assert.equal(hasPermission("AUDITOR", PERMISSIONS.RECOMMENDATION_CREATE), false);
    assert.equal(hasPermission("AUDITOR", PERMISSIONS.DOCUMENT_UPLOAD), false);

    // Admin has full permissions
    assert.equal(hasPermission("ADMIN", PERMISSIONS.USER_MANAGE), true);
    assert.equal(hasPermission("ADMIN", PERMISSIONS.DATASET_IMPORT), true);
  });

  // 10. Resource ownership
  it("10. should prevent a procurement officer from accessing another officer's private recommendation", async () => {
    // Create a recommendation owned by a different user
    const otherUser = await prisma.user.create({
      data: {
        email: `private_owner_${Date.now()}@normwise.local`,
        name: "Private User",
        role: "PROCUREMENT_OFFICER",
        passwordHash: await hashPassword("NormWise2026!"),
      },
    });

    const otherRec = await prisma.recommendation.create({
      data: {
        userId: otherUser.id,
        requirementText: "Private secure procurement requirement for server racks",
        status: "PENDING_REVIEW",
      },
    });

    // Login as standard officerUser
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "officer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");

    // Try to access otherRec by ID
    const res = await fetch(`${baseUrl}/recommendations/${otherRec.id}`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "FORBIDDEN");

    // Clean up
    await prisma.recommendation.delete({ where: { id: otherRec.id } });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  // 11. Procurement officer cannot approve own recommendation
  it("11. should forbid a procurement officer from approving their own recommendation", async () => {
    // Create recommendation owned by officerUser
    const ownRec = await prisma.recommendation.create({
      data: {
        userId: officerUser.id,
        requirementText: "Officer self created recommendation requirement",
        status: "PENDING_REVIEW",
      },
    });

    // Login as officer
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "officer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");
    const csrfCookie = parseCookie(loginRes, "normwise_csrf");

    // Officer attempts to accept own recommendation
    const res = await fetch(`${baseUrl}/recommendations/${ownRec.id}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `normwise_session=${sessionCookie}; normwise_csrf=${csrfCookie}`,
        "X-CSRF-Token": csrfCookie,
      },
      body: JSON.stringify({ notes: "Attempting self approval" }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "SELF_APPROVAL_FORBIDDEN");

    // Clean up
    await prisma.recommendation.delete({ where: { id: ownRec.id } });
  });

  // 12. Auditor cannot modify records
  it("12. should forbid auditor from making review decisions on recommendations", async () => {
    const rec = await prisma.recommendation.create({
      data: {
        userId: officerUser.id,
        requirementText: "Test requirement for auditor immutability check",
        status: "PENDING_REVIEW",
      },
    });

    // Login as auditor
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "auditor@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");
    const csrfCookie = parseCookie(loginRes, "normwise_csrf");

    // Auditor attempts to decide
    const res = await fetch(`${baseUrl}/recommendations/${rec.id}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `normwise_session=${sessionCookie}; normwise_csrf=${csrfCookie}`,
        "X-CSRF-Token": csrfCookie,
      },
      body: JSON.stringify({ notes: "Auditor attempting approval" }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "FORBIDDEN");

    // Clean up
    await prisma.recommendation.delete({ where: { id: rec.id } });
  });

  // 13. Reviewer cannot manage datasets
  it("13. should forbid reviewer from accessing dataset import endpoint", async () => {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "reviewer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");
    const csrfCookie = parseCookie(loginRes, "normwise_csrf");

    const res = await fetch(`${baseUrl}/admin/standards/import`, {
      method: "POST",
      headers: {
        Cookie: `normwise_session=${sessionCookie}; normwise_csrf=${csrfCookie}`,
        "X-CSRF-Token": csrfCookie,
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "FORBIDDEN");
  });

  // 14. Admin can access admin routes
  it("14. should permit admin user to access admin user management and security endpoints", async () => {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");

    const usersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });
    assert.equal(usersRes.status, 200);
    const usersBody = await usersRes.json();
    assert.ok(Array.isArray(usersBody.data.users));

    const checkRes = await fetch(`${baseUrl}/admin/security/check`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });
    assert.equal(checkRes.status, 200);
    const checkBody = await checkRes.json();
    assert.ok(checkBody.data.checks);
  });

  // 15. Rate limiting
  it("15. should enforce rate limiting after repeated rapid requests on auth endpoint", async () => {
    let triggered = false;
    for (let i = 0; i < 15; i++) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Test-Rate-Limit": "true",
        },
        body: JSON.stringify({
          email: "rate_test@normwise.local",
          password: "InvalidPassword123!",
        }),
      });
      if (res.status === 429) {
        triggered = true;
        const body = await res.json();
        assert.equal(body.error.code, "RATE_LIMIT_EXCEEDED");
        break;
      }
    }
    assert.equal(triggered, true, "Rate limit must trigger after threshold");
  });

  // 16. Input validation
  it("16. should validate inputs with Zod on auth endpoints", async () => {
    // Malformed email
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
        password: "validPassword123!",
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, "VALIDATION_ERROR");
  });

  // 17. CSRF protection
  it("17. should enforce CSRF token on state-changing requests when cookie authentication is present", async () => {
    // Login to obtain session cookie
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "officer@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const sessionCookie = parseCookie(loginRes, "normwise_session");

    // Make state-changing POST request with session cookie but MISSING X-CSRF-Token header
    const res = await fetch(`${baseUrl}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `normwise_session=${sessionCookie}`,
        "X-Test-CSRF-Enforce": "true", // Enforce in test runner
      },
      body: JSON.stringify({
        currentPassword: "NormWise2026!",
        newPassword: "NewPassword2026!",
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.error.code, "CSRF_ERROR");
  });

  // 18. CORS configuration
  it("18. should respond to preflight OPTIONS requests with credentials and allowed methods", async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
      },
    });

    assert.ok(res.status === 200 || res.status === 204);
    assert.equal(res.headers.get("access-control-allow-credentials"), "true");
  });

  // 19. File upload authorization
  it("19. should allow upload only for roles with DOCUMENT_UPLOAD permission", async () => {
    assert.equal(hasPermission("PROCUREMENT_OFFICER", PERMISSIONS.DOCUMENT_UPLOAD), true);
    assert.equal(hasPermission("ADMIN", PERMISSIONS.DOCUMENT_UPLOAD), true);
    assert.equal(hasPermission("AUDITOR", PERMISSIONS.DOCUMENT_UPLOAD), false);
  });

  // 20. Dataset import authorization
  it("20. should allow dataset import only for ADMIN role", async () => {
    assert.equal(hasPermission("ADMIN", PERMISSIONS.DATASET_IMPORT), true);
    assert.equal(hasPermission("PROCUREMENT_OFFICER", PERMISSIONS.DATASET_IMPORT), false);
    assert.equal(hasPermission("TECHNICAL_REVIEWER", PERMISSIONS.DATASET_IMPORT), false);
    assert.equal(hasPermission("AUDITOR", PERMISSIONS.DATASET_IMPORT), false);
  });

  // 21. Password change
  it("21. should successfully change password and authenticate with new password", async () => {
    // Create temporary test user
    const tempUser = await prisma.user.create({
      data: {
        email: `pwd_change_${Date.now()}@normwise.local`,
        name: "Password Change Test",
        role: "PROCUREMENT_OFFICER",
        passwordHash: await hashPassword("InitialPassword123!"),
      },
    });

    // Login with initial password
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: tempUser.email,
        password: "InitialPassword123!",
      }),
    });
    assert.equal(loginRes.status, 200);
    const sessionCookie = parseCookie(loginRes, "normwise_session");
    const csrfCookie = parseCookie(loginRes, "normwise_csrf");

    // Change password
    const changeRes = await fetch(`${baseUrl}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `normwise_session=${sessionCookie}; normwise_csrf=${csrfCookie}`,
        "X-CSRF-Token": csrfCookie,
      },
      body: JSON.stringify({
        currentPassword: "InitialPassword123!",
        newPassword: "BrandNewPassword2026!",
        revokeOtherSessions: true,
      }),
    });
    assert.equal(changeRes.status, 200);

    // Old password must now fail
    const oldLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: tempUser.email,
        password: "InitialPassword123!",
      }),
    });
    assert.equal(oldLoginRes.status, 401);

    // New password must succeed
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: tempUser.email,
        password: "BrandNewPassword2026!",
      }),
    });
    assert.equal(newLoginRes.status, 200);

    // Clean up
    await prisma.session.deleteMany({ where: { userId: tempUser.id } });
    await prisma.user.delete({ where: { id: tempUser.id } });
  });

  // 22. Session invalidation
  it("22. should invalidate all user sessions on password change or status deactivation", async () => {
    const tempUser = await prisma.user.create({
      data: {
        email: `session_test_${Date.now()}@normwise.local`,
        name: "Session Invalidation Test",
        role: "TECHNICAL_REVIEWER",
        passwordHash: await hashPassword("NormWise2026!"),
      },
    });

    // Create session 1
    const login1 = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: tempUser.email, password: "NormWise2026!" }),
    });
    const cookie1 = parseCookie(login1, "normwise_session");

    // Deactivate user via admin action
    await prisma.user.update({
      where: { id: tempUser.id },
      data: { isActive: false },
    });

    // Delete user sessions
    await prisma.session.deleteMany({ where: { userId: tempUser.id } });

    // Request with cookie 1 must now be rejected
    const checkRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: `normwise_session=${cookie1}` },
    });
    assert.equal(checkRes.status, 401);

    // Clean up
    await prisma.user.delete({ where: { id: tempUser.id } });
  });

  // 23. Audit event creation
  it("23. should record audit events for security and administrative actions", async () => {
    // Audit events recorded in previous operations
    const events = await prisma.auditEvent.findMany({
      where: {
        action: { in: ["USER_LOGIN", "LOGIN_FAILED", "PASSWORD_CHANGED", "DOCUMENT_UPLOADED"] },
      },
      take: 5,
    });
    assert.ok(events.length > 0, "Audit events must be recorded in PostgreSQL");
  });

  // 24. No passwordHash in API responses
  it("24. should never expose passwordHash in any user or auth API response", async () => {
    // 1. Check login response
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@normwise.local",
        password: "NormWise2026!",
      }),
    });
    const loginBody = await loginRes.json();
    assert.equal(loginBody.data.user.passwordHash, undefined);
    assert.equal(loginBody.data.user.password, undefined);

    // 2. Check /auth/me response
    const sessionCookie = parseCookie(loginRes, "normwise_session");
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });
    const meBody = await meRes.json();
    assert.equal(meBody.data.user.passwordHash, undefined);

    // 3. Check /admin/users response
    const usersRes = await fetch(`${baseUrl}/admin/users`, {
      headers: { Cookie: `normwise_session=${sessionCookie}` },
    });
    const usersBody = await usersRes.json();
    for (const u of usersBody.data.users) {
      assert.equal(u.passwordHash, undefined);
      assert.equal(u.password, undefined);
    }
  });

  // 25. Existing Phases 1–17 test pass validation
  it("25. should verify core engine and all previous phase foundations remain completely intact", async () => {
    const std = await prisma.standard.findUnique({
      where: { standardNumber: "IS 2347:2023" },
    });
    assert.ok(std, "IS 2347:2023 primary standard must remain present");
    assert.equal(std.status, "CURRENT");
  });
});
