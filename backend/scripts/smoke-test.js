#!/usr/bin/env node
/**
 * NormWise Production Smoke Test Suite (Phase 19)
 *
 * Verifies non-destructive core application flows against a live running NormWise instance:
 * 1. Backend Liveness (/api/health)
 * 2. Database & Vector Readiness (/api/health/ready)
 * 3. Version (/api/version)
 * 4. Standards Catalog (/api/standards?limit=5)
 * 5. Recommendation Engine (/api/recommend)
 * 6. Authentication (/api/auth/login)
 * 7. Authenticated Profile (/api/auth/me)
 * 8. Admin System Telemetry (/api/admin/system/health)
 *
 * Usage:
 *   API_URL=http://localhost:5001/api node bin/smoke-test.js
 */

import "dotenv/config";

const BASE_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 5001}/api`;
const TEST_EMAIL = process.env.SMOKE_EMAIL || "officer@normwise.local";
const TEST_PASSWORD = process.env.SMOKE_PASSWORD || "NormWise2026!";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@normwise.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "NormWise2026!";

let passes = 0;
let failures = 0;

function report(step, description, success, details = "") {
  if (success) {
    passes++;
    console.log(`  [PASS] Step ${step}: ${description} ${details ? `(${details})` : ""}`);
  } else {
    failures++;
    console.error(`  [FAIL] Step ${step}: ${description} ${details ? `[Error: ${details}]` : ""}`);
  }
}

async function runSmokeTests() {
  console.log("==================================================");
  console.log("       NormWise Production Smoke Test Suite       ");
  console.log("==================================================");

  let targetUrl = BASE_URL;
  let standaloneServer = null;

  // Probe if target server is running; if not, spin up local instance for testing
  try {
    const probe = await fetch(`${targetUrl}/health`).catch(() => null);
    if (!probe) {
      console.log(`No active server on ${targetUrl}. Initializing standalone instance...`);
      const { default: app } = await import("../src/app.js");
      const { default: prisma } = await import("../src/config/db.js");
      await prisma.$connect();
      const testPort = 5088;
      targetUrl = `http://127.0.0.1:${testPort}/api`;
      await new Promise((resolve) => {
        standaloneServer = app.listen(testPort, resolve);
      });
      console.log(`Standalone instance active on ${targetUrl}\n`);
    } else {
      console.log(`Connected to active server at ${targetUrl}\n`);
    }
  } catch (err) {
    console.error("Initialization error:", err.message);
  }

  const startTime = Date.now();

  // Step 1: Liveness Health Check
  try {
    const res = await fetch(`${targetUrl}/health`);
    const data = await res.json();
    const ok = res.status === 200 && data.status === "ok";
    report(1, "Backend Liveness Check (/api/health)", ok, `Status: ${res.status}`);
  } catch (err) {
    report(1, "Backend Liveness Check (/api/health)", false, err.message);
  }

  // Step 2: Readiness Health Check (DB + pgvector + storage)
  try {
    const res = await fetch(`${targetUrl}/health/ready`);
    const data = await res.json();
    const ok = res.status === 200 && data.status === "ready" && data.database === "ok" && data.vectorStore === "ok";
    report(2, "Readiness Check (/api/health/ready)", ok, `DB: ${data.database}, Vector: ${data.vectorStore}, Storage: ${data.storage}`);
  } catch (err) {
    report(2, "Readiness Check (/api/health/ready)", false, err.message);
  }

  // Step 3: Version Info
  try {
    const res = await fetch(`${targetUrl}/version`);
    const data = await res.json();
    const ok = res.status === 200 && data.name === "NormWise";
    report(3, "Version Endpoint (/api/version)", ok, `v${data.version} (${data.environment})`);
  } catch (err) {
    report(3, "Version Endpoint (/api/version)", false, err.message);
  }

  // Step 4: Standards Catalog
  try {
    const res = await fetch(`${targetUrl}/standards?limit=3`);
    const data = await res.json();
    const ok = res.status === 200 && Array.isArray(data.data) && data.data.length > 0;
    report(4, "Standards Catalog Query (/api/standards)", ok, `Retrieved ${data.data?.length || 0} standards`);
  } catch (err) {
    report(4, "Standards Catalog Query (/api/standards)", false, err.message);
  }

  // Step 5: Recommendation Engine (Sample Non-Destructive Query)
  try {
    const sampleReq = "Stainless steel pressure cooker 5 litre for institutional kitchen";
    const res = await fetch(`${targetUrl}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirementText: sampleReq }),
    });
    const data = await res.json();
    const ok = res.status === 200 && data.success && data.data?.primaryStandard;
    const topStd = data.data?.primaryStandard?.standardNumber || "None";
    const score = data.data?.primaryStandard?.score || 0;
    report(5, "Recommendation Engine (/api/recommend)", ok, `Top Match: ${topStd}, Score: ${score}`);
  } catch (err) {
    report(5, "Recommendation Engine (/api/recommend)", false, err.message);
  }

  // Step 6: Authentication Login Flow
  let sessionCookie = null;
  try {
    const res = await fetch(`${targetUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    });
    const data = await res.json();
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      sessionCookie = setCookie.split(";")[0];
    }
    const ok = res.status === 200 && data.user && data.user.email === TEST_EMAIL;
    report(6, "User Authentication (/api/auth/login)", ok, `User: ${data.user?.name} [${data.user?.role}]`);
  } catch (err) {
    report(6, "User Authentication (/api/auth/login)", false, err.message);
  }

  // Step 7: Authenticated Profile Endpoint
  if (sessionCookie) {
    try {
      const res = await fetch(`${targetUrl}/auth/me`, {
        headers: { Cookie: sessionCookie },
      });
      const data = await res.json();
      const ok = res.status === 200 && data.user?.email === TEST_EMAIL;
      report(7, "Authenticated Session Check (/api/auth/me)", ok, `Verified active session for ${data.user?.email}`);
    } catch (err) {
      report(7, "Authenticated Session Check (/api/auth/me)", false, err.message);
    }
  } else {
    report(7, "Authenticated Session Check (/api/auth/me)", false, "Skipped due to login failure");
  }

  // Step 8: Admin Monitoring Endpoint (with Admin login)
  try {
    const adminLoginRes = await fetch(`${targetUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const adminSetCookie = adminLoginRes.headers.get("set-cookie");
    const adminCookie = adminSetCookie ? adminSetCookie.split(";")[0] : null;

    if (adminCookie) {
      const monitorRes = await fetch(`${targetUrl}/admin/system/health`, {
        headers: { Cookie: adminCookie },
      });
      const monitorData = await monitorRes.json();
      const ok = monitorRes.status === 200 && monitorData.services?.api === "AVAILABLE";
      report(8, "Admin Telemetry Health Check (/api/admin/system/health)", ok, `DB: ${monitorData.services?.database}, Uptime: ${monitorData.system?.uptimeSeconds}s`);
    } else {
      report(8, "Admin Telemetry Health Check (/api/admin/system/health)", false, "Admin login failed");
    }
  } catch (err) {
    report(8, "Admin Telemetry Health Check (/api/admin/system/health)", false, err.message);
  }

  const duration = Date.now() - startTime;
  console.log("\n--------------------------------------------------");
  console.log(`Smoke Test Results: ${passes} Passed, ${failures} Failed (${duration}ms)`);
  console.log("--------------------------------------------------\n");

  if (standaloneServer) {
    await new Promise((resolve) => standaloneServer.close(resolve));
    const { default: prisma } = await import("../src/config/db.js");
    await prisma.$disconnect();
  }

  if (failures > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSmokeTests();
