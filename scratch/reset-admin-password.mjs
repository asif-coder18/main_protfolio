// Admin Password Reset Script
// Usage: node scratch/reset-admin-password.mjs <new-password>
// Or without arg: defaults to "admin123"

import { Client, Databases, Query } from "node-appwrite";
import bcrypt from "bcryptjs";

const ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = "69fc9801002376d91970";
const API_KEY =
  "standard_b7338cde001c1775d05adf125eb4596abb119c9c7089c1726a8b354306f8c9a77da1408692182aa5d5df5a9063f6c75b0411a47ca6721c7dc62d0e736680c6de7937998922096bb32877c909c6be26deaa72c2c463df55611f45fd29bf2a73fe4b8c485c3b5ad3bbd6cec282afd6e7c84f534eb4b34bf142d2de8e1593bd92f1";
const DATABASE_ID = "69fc991e002fe5327e37";
const ADMIN_COLLECTION = "admin";

const newPassword = process.argv[2] || "admin123";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const db = new Databases(client);

async function resetPassword() {
  console.log("🔍 Fetching admin documents...");

  const result = await db.listDocuments(DATABASE_ID, ADMIN_COLLECTION, [
    Query.limit(10),
  ]);

  if (result.total === 0) {
    console.log("❌ No admin document found in DB!");
    console.log(
      '   First time? Log in with username "admin" and any password to auto-create.'
    );
    return;
  }

  console.log(`✅ Found ${result.total} admin document(s):`);
  result.documents.forEach((doc) => {
    console.log(`   - ID: ${doc.$id}, Username: ${doc.username}`);
  });

  const adminDoc = result.documents[0];
  const hash = await bcrypt.hash(newPassword, 12);

  await db.updateDocument(DATABASE_ID, ADMIN_COLLECTION, adminDoc.$id, {
    passwordHash: hash,
  });

  console.log(`\n✅ Password reset successfully!`);
  console.log(`   Username : ${adminDoc.username}`);
  console.log(`   Password : ${newPassword}`);
}

resetPassword().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

