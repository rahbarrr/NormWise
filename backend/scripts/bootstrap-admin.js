#!/usr/bin/env node
/**
 * NormWise Production Admin Bootstrapping Script (Phase 19)
 *
 * Securely provisions the initial System Administrator account in a clean
 * production database without injecting demo standards, fake records, or mock data.
 *
 * Usage:
 *   ADMIN_EMAIL="admin@agency.gov.in" ADMIN_PASSWORD="SecurePassword123!" node bin/bootstrap-admin.js
 */

import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import prisma from "../src/config/db.js";

async function bootstrapAdmin() {
  console.log("==================================================");
  console.log("  NormWise Production Admin Account Bootstrapper  ");
  console.log("==================================================");

  const email = (process.env.ADMIN_EMAIL || "admin@normwise.gov.in").toLowerCase().trim();
  let rawPassword = process.env.ADMIN_PASSWORD;
  let isGenerated = false;

  if (!rawPassword) {
    // Generate secure 16-character random alphanumeric password
    rawPassword = crypto.randomBytes(12).toString("base64url").slice(0, 16) + "!A1";
    isGenerated = true;
  }

  const name = process.env.ADMIN_NAME || "System Administrator";
  const department = process.env.ADMIN_DEPARTMENT || "Central Procurement Administration";

  console.log(`Target Email: ${email}`);
  console.log(`Department:   ${department}`);

  try {
    await prisma.$connect();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    if (existing) {
      console.log(`\nUser with email ${email} already exists.`);
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: "ADMIN",
          isActive: true,
          passwordHash,
          name,
        },
      });
      console.log(`Successfully elevated and updated administrator user: ${updated.id}`);
    } else {
      const created = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          role: "ADMIN",
          isActive: true,
        },
      });
      console.log(`Successfully provisioned initial administrator user: ${created.id}`);

      // Record audit event
      await prisma.auditEvent.create({
        data: {
          action: "ADMIN_BOOTSTRAP",
          entityType: "USER",
          entityId: created.id,
          actorId: created.id,
          metadata: {
            email,
            department,
            bootstrapSource: "CLI_BOOTSTRAP",
          },
        },
      });
    }

    console.log("\n--------------------------------------------------");
    console.log("Admin provisioning completed successfully!");
    if (isGenerated) {
      console.log("Generated Admin Credentials (SAVE SECURELY):");
      console.log(`  Email:    ${email}`);
      console.log(`  Password: ${rawPassword}`);
      console.log("NOTE: Please change this password upon first login.");
    } else {
      console.log(`Administrator password has been set from environment variable.`);
    }
    console.log("--------------------------------------------------\n");

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n[Error] Admin bootstrapping failed:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrapAdmin();
