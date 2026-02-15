/**
 * Migration script: Move flat Firestore collections to company-scoped subcollections.
 *
 * This script:
 * 1. Creates a default company doc at /companies/{companyId}
 * 2. Copies all docs from /sessions → /companies/{companyId}/sessions
 * 3. Copies all docs from /scored_interviews → /companies/{companyId}/scored_interviews
 *
 * Usage:
 *   node scripts/migrate-to-multi-tenant.js <companyId> <companyName>
 *
 * Example:
 *   node scripts/migrate-to-multi-tenant.js default "My Company"
 *
 * Prerequisites:
 *   - Set GOOGLE_APPLICATION_CREDENTIALS env var to path of Firebase service account JSON
 *   - Or run: export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node scripts/migrate-to-multi-tenant.js <companyId> <companyName>");
  process.exit(1);
}

const [companyId, companyName] = args;

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS env var to your Firebase service account JSON path");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function migrate() {
  console.log(`Migrating data to company: ${companyId} (${companyName})`);

  // 1. Create company document
  const companyRef = db.doc(`companies/${companyId}`);
  const companyDoc = await companyRef.get();
  if (!companyDoc.exists) {
    await companyRef.set({
      name: companyName,
      plan: "standard",
      createdAt: new Date().toISOString(),
      settings: {},
    });
    console.log(`Created company: ${companyId}`);
  } else {
    console.log(`Company ${companyId} already exists, skipping creation`);
  }

  // 2. Migrate sessions
  const sessionsSnap = await db.collection("sessions").get();
  console.log(`Found ${sessionsSnap.size} sessions to migrate`);

  let sessionCount = 0;
  for (const doc of sessionsSnap.docs) {
    const targetRef = db.doc(`companies/${companyId}/sessions/${doc.id}`);
    const existing = await targetRef.get();
    if (!existing.exists) {
      await targetRef.set(doc.data());
      sessionCount++;
    }
  }
  console.log(`Migrated ${sessionCount} sessions`);

  // 3. Migrate scored_interviews
  const scoredSnap = await db.collection("scored_interviews").get();
  console.log(`Found ${scoredSnap.size} scored interviews to migrate`);

  let scoredCount = 0;
  for (const doc of scoredSnap.docs) {
    const targetRef = db.doc(`companies/${companyId}/scored_interviews/${doc.id}`);
    const existing = await targetRef.get();
    if (!existing.exists) {
      await targetRef.set(doc.data());
      scoredCount++;
    }
  }
  console.log(`Migrated ${scoredCount} scored interviews`);

  console.log("\nMigration complete!");
  console.log(`Company: ${companyId} (${companyName})`);
  console.log(`Sessions: ${sessionCount} migrated`);
  console.log(`Scored interviews: ${scoredCount} migrated`);
}

migrate().catch(console.error);
