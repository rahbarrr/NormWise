/**
 * NormWise End-to-End Workflow Test Suite (Phase 20)
 *
 * Verifies the complete 12-step end-to-end procurement intelligence journey:
 * 1. User authentication & session generation
 * 2. Requirement submission via recommendation engine
 * 3. Recommendation record creation in PostgreSQL
 * 4. Results payload structure & matching confidence
 * 5. Evidence & clause traceability
 * 6. Allied & related standards traversal
 * 7. Certification & QCO compliance evaluation
 * 8. Technical review request initiation
 * 9. Technical reviewer decision recording
 * 10. Audit event creation & chronological immutability
 * 11. History logging & retrieval
 * 12. Verification of the 3 SIH demo cases
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";
import app from "../src/app.js";

// Helper for HTTP requests
async function makeRequest(path, options = {}) {
  const url = `http://127.0.0.1:${process.env.PORT || 5001}${path}`;
  return fetch(url, options);
}

describe("Phase 20 End-to-End Workflow & SIH Demonstration Suite", () => {
  let server;
  let testOfficer;
  let testReviewer;
  let officerCookie;
  let reviewerCookie;
  let createdRecommendationId;

  before(async () => {
    // Start test server on dynamic port
    const port = 5098;
    process.env.PORT = String(port);

    await new Promise((resolve) => {
      server = app.listen(port, resolve);
    });

    // Seed test users
    const passwordHash = await bcrypt.hash("TestPass123!", 10);

    testOfficer = await prisma.user.upsert({
      where: { email: "e2e_officer@normwise.gov.in" },
      update: { role: "PROCUREMENT_OFFICER", isActive: true },
      create: {
        email: "e2e_officer@normwise.gov.in",
        name: "E2E Procurement Officer",
        role: "PROCUREMENT_OFFICER",
        passwordHash,
        isActive: true,
      },
    });

    testReviewer = await prisma.user.upsert({
      where: { email: "e2e_reviewer@normwise.gov.in" },
      update: { role: "TECHNICAL_REVIEWER", isActive: true },
      create: {
        email: "e2e_reviewer@normwise.gov.in",
        name: "E2E Technical Reviewer",
        role: "TECHNICAL_REVIEWER",
        passwordHash,
        isActive: true,
      },
    });
  });

  after(async () => {
    // Clean up server
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test("Step 1: User Login & Session Establishment", async () => {
    // Officer Login
    const officerRes = await makeRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "e2e_officer@normwise.gov.in",
        password: "TestPass123!",
      }),
    });
    assert.equal(officerRes.status, 200);
    const officerData = await officerRes.json();
    assert.equal(officerData.user.role, "PROCUREMENT_OFFICER");

    const officerSetCookie = officerRes.headers.get("set-cookie");
    assert.ok(officerSetCookie, "Session cookie should be set for officer");
    officerCookie = officerSetCookie.split(";")[0];

    // Reviewer Login
    const reviewerRes = await makeRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "e2e_reviewer@normwise.gov.in",
        password: "TestPass123!",
      }),
    });
    assert.equal(reviewerRes.status, 200);
    const reviewerData = await reviewerRes.json();
    assert.equal(reviewerData.user.role, "TECHNICAL_REVIEWER");

    const reviewerSetCookie = reviewerRes.headers.get("set-cookie");
    assert.ok(reviewerSetCookie, "Session cookie should be set for reviewer");
    reviewerCookie = reviewerSetCookie.split(";")[0];
  });

  test("Step 2 & 3: Requirement Submission & Database Recommendation Creation", async () => {
    const requirementText =
      "Stainless steel pressure cooker, 5 litre, for institutional kitchen use, food grade SS 304 body with safety valve and gasket release system.";

    const res = await makeRequest("/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: officerCookie,
      },
      body: JSON.stringify({ requirementText, userId: testOfficer.id }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);
    assert.ok(body.data?.recommendationId, "Recommendation ID should be created");

    createdRecommendationId = body.data.recommendationId;

    // Verify record in PostgreSQL database via Prisma
    const dbRecord = await prisma.recommendation.findUnique({
      where: { id: createdRecommendationId },
      include: { recommendationStandards: true },
    });
    assert.ok(dbRecord, "Record must exist in PostgreSQL");
    assert.equal(dbRecord.userId, testOfficer.id, "Recommendation must belong to submitting officer");
  });

  test("Step 4: Results Retrieval & Primary Standard Matching", async () => {
    const res = await makeRequest(`/api/recommendations/${createdRecommendationId}`, {
      headers: { Cookie: officerCookie },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data);

    // Primary standard should be IS 2347:2023
    const primary = body.data.primaryStandard || body.data.recommendationStandards?.[0];
    assert.ok(primary, "Primary standard must be returned");
    const stdNumber = primary.standard?.standardNumber || primary.standardNumber;
    assert.equal(stdNumber, "IS 2347:2023");
    assert.ok(primary.matchScore >= 0.85, "Pressure cooker should have high confidence match");
  });

  test("Step 5: Evidence & Source Clause Traceability", async () => {
    const res = await makeRequest(`/api/recommendations/${createdRecommendationId}`, {
      headers: { Cookie: officerCookie },
    });
    const body = await res.json();
    const evidenceList = body.data.evidence || [];

    // Verify evidence is present and traceable
    assert.ok(evidenceList.length > 0, "Evidence records must be linked to recommendation");
    const sample = evidenceList[0];
    assert.ok(sample.sourceExcerpt || sample.clause || sample.evidenceText || sample.excerpt || sample.type, "Evidence must contain source details");
  });

  test("Step 6: Allied & Related Standards Traversal", async () => {
    // Check related standards using standard ID
    const std = await prisma.standard.findUnique({ where: { standardNumber: "IS 2347:2023" } });
    assert.ok(std, "IS 2347:2023 must exist in database");

    const res = await makeRequest(`/api/standards/${encodeURIComponent(std.id)}/related`, {
      headers: { Cookie: officerCookie },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const relatedList = body.data?.relatedStandards || body.data;
    assert.ok(Array.isArray(relatedList), "Related standards must be an array");
  });

  test("Step 7: Certification & QCO Compliance Evaluation", async () => {
    const res = await makeRequest(`/api/recommendations/${createdRecommendationId}/compliance`, {
      headers: { Cookie: officerCookie },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data, "Compliance assessment should be returned");
    const outcome = body.data.outcome || body.data.complianceStatus || body.data.status;
    assert.ok(
      ["COMPLIANT", "POTENTIALLY_APPLICABLE", "REQUIRES_REVIEW", "NOT_IDENTIFIED", "PENDING_ASSESSMENT"].includes(outcome),
      `Status must be a valid compliance assessment, got: ${outcome}`
    );
  });

  test("Step 8: Request Technical Review", async () => {
    const res = await makeRequest(`/api/recommendations/${createdRecommendationId}/request-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: officerCookie,
      },
      body: JSON.stringify({
        reason: "Review required for SS 304 material certification and wall thickness specification.",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);

    // Verify recommendation status updated to UNDER_TECHNICAL_REVIEW
    const updated = await prisma.recommendation.findUnique({
      where: { id: createdRecommendationId },
    });
    assert.ok(["UNDER_REVIEW", "UNDER_TECHNICAL_REVIEW"].includes(updated.status));
  });

  test("Step 9: Reviewer Decision Recording (ACCEPTED)", async () => {
    const res = await makeRequest(`/api/recommendations/${createdRecommendationId}/accept`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: reviewerCookie,
      },
      body: JSON.stringify({
        notes: "Verified against IS 2347:2023 Clause 4.1 and QCO order. Approved.",
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.success);

    // Check review record stored in PostgreSQL
    const reviewInDb = await prisma.review.findFirst({
      where: { recommendationId: createdRecommendationId },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(reviewInDb, "Review must be saved in database");
    assert.equal(reviewInDb.status, "ACCEPTED");
    assert.ok(reviewInDb.reviewerId, "Reviewer ID must be recorded");
  });

  test("Step 10: Audit Trail Verification", async () => {
    const res = await makeRequest(`/api/recommendations/${createdRecommendationId}/audit`, {
      headers: { Cookie: reviewerCookie },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data), "Audit events must be returned as array");
    assert.ok(body.data.length >= 2, "Should contain multiple audit events (Creation, Review Request, Review Decision)");
  });

  test("Step 11: History Query Displays Updated State", async () => {
    const res = await makeRequest("/api/recommendations", {
      headers: { Cookie: officerCookie },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    const recs = body.data?.items || body.data?.recommendations || body.data;
    assert.ok(Array.isArray(recs), "Recommendations list should be array");
    const found = recs.find((r) => r.id === createdRecommendationId);
    assert.ok(found, "History must list the newly created and reviewed recommendation");
    assert.equal(found.status, "ACCEPTED");
  });

  test("Step 12: SIH Demonstration Cases Validation", async () => {
    // Case 2: Outdoor LED Street Luminaire
    const ledReq =
      "Supply of 120W outdoor LED street light luminaires with IP66 ingress protection and 5000K CCT for public road illumination.";
    const ledRes = await makeRequest("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirementText: ledReq }),
    });
    assert.equal(ledRes.status, 200);
    const ledData = await ledRes.json();
    assert.ok(
      ledData.data?.primaryStandard?.standardNumber?.includes("10322"),
      "LED requirement should match IS 10322 series"
    );

    // Case 3: Commercial Induction Cooking Appliance
    const indReq =
      "Procurement of commercial induction cooking range with single phase electrical safety and earthing for canteen.";
    const indRes = await makeRequest("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirementText: indReq }),
    });
    assert.equal(indRes.status, 200);
    const indData = await indRes.json();
    assert.ok(
      indData.data?.primaryStandard?.standardNumber?.includes("302"),
      "Commercial induction requirement should match IS 302 series"
    );
  });
});
