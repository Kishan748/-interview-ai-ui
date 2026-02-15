/**
 * Admin script: Onboard a new company.
 *
 * This script:
 * 1. Creates a Firebase Auth user for the company admin
 * 2. Creates a company document in Firestore
 * 3. Creates a user-to-company mapping in /users/{uid}
 * 4. Creates a member record in /companies/{companyId}/members/{uid}
 *
 * Usage:
 *   node scripts/onboard-company.js \
 *     --company-name "Acme Corp" \
 *     --company-id "acme" \
 *     --admin-email "admin@acme.com" \
 *     --admin-password "tempPassword123" \
 *     --admin-name "John Doe"
 *
 * Prerequisites:
 *   - Set GOOGLE_APPLICATION_CREDENTIALS env var to path of Firebase service account JSON
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// Parse CLI args
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "").replace(/-/g, "_");
    args[key] = argv[i + 1];
  }
  return args;
}

const args = parseArgs(process.argv);
const required = ["company_name", "company_id", "admin_email", "admin_password", "admin_name"];
for (const key of required) {
  if (!args[key]) {
    console.error(`Missing required argument: --${key.replace(/_/g, "-")}`);
    console.error("\nUsage:");
    console.error("  node scripts/onboard-company.js \\");
    console.error('    --company-name "Acme Corp" \\');
    console.error('    --company-id "acme" \\');
    console.error('    --admin-email "admin@acme.com" \\');
    console.error('    --admin-password "tempPassword123" \\');
    console.error('    --admin-name "John Doe"');
    process.exit(1);
  }
}

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS env var to your Firebase service account JSON path");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function onboard() {
  const { company_name, company_id, admin_email, admin_password, admin_name } = args;

  console.log(`\nOnboarding company: ${company_name} (${company_id})`);
  console.log(`Admin: ${admin_name} <${admin_email}>\n`);

  // 1. Create Firebase Auth user
  let uid;
  try {
    const userRecord = await auth.createUser({
      email: admin_email,
      password: admin_password,
      displayName: admin_name,
    });
    uid = userRecord.uid;
    console.log(`Created Firebase Auth user: ${uid}`);
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      const existing = await auth.getUserByEmail(admin_email);
      uid = existing.uid;
      console.log(`User already exists: ${uid}`);
    } else {
      throw err;
    }
  }

  // 2. Create company document
  const companyRef = db.doc(`companies/${company_id}`);
  const companyDoc = await companyRef.get();
  if (!companyDoc.exists) {
    await companyRef.set({
      name: company_name,
      plan: "standard",
      createdAt: new Date().toISOString(),
      settings: {},
    });
    console.log(`Created company document: /companies/${company_id}`);
  } else {
    console.log(`Company document already exists`);
  }

  // 3. Create user-to-company mapping
  await db.doc(`users/${uid}`).set({
    companyId: company_id,
    email: admin_email,
    name: admin_name,
    role: "admin",
    createdAt: new Date().toISOString(),
  });
  console.log(`Created user mapping: /users/${uid}`);

  // 4. Create member record in company
  await db.doc(`companies/${company_id}/members/${uid}`).set({
    email: admin_email,
    name: admin_name,
    role: "admin",
    joinedAt: new Date().toISOString(),
  });
  console.log(`Created member record: /companies/${company_id}/members/${uid}`);

  console.log("\nOnboarding complete!");
  console.log("─".repeat(40));
  console.log(`Company: ${company_name}`);
  console.log(`Login:   ${admin_email}`);
  console.log(`Password: ${admin_password}`);
  console.log("─".repeat(40));
  console.log("\nRemind the admin to change their password after first login.");
}

onboard().catch(console.error);
