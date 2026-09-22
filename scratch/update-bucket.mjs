import { Client, Storage, Permission, Role } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69fc9801002376d91970";
const API_KEY = process.env.APPWRITE_API_KEY || "standard_b7338cde001c1775d05adf125eb4596abb119c9c7089c1726a8b354306f8c9a77da1408692182aa5d5df5a9063f6c75b0411a47ca6721c7dc62d0e736680c6de7937998922096bb32877c909c6be26deaa72c2c463df55611f45fd29bf2a73fe4b8c485c3b5ad3bbd6cec282afd6e7c84f534eb4b34bf142d2de8e1593bd92f1";
const BUCKET_ID = "portfolio_uploads";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const storage = new Storage(client);

async function run() {
  try {
    console.log("Checking Appwrite bucket:", BUCKET_ID);
    let bucket;
    try {
      bucket = await storage.getBucket(BUCKET_ID);
      console.log("Found existing bucket:", bucket.$id, "Current max size:", bucket.maximumFileSize);
      
      // Update bucket max file size to 50MB (50 * 1024 * 1024) and allow all extensions
      await storage.updateBucket(
        BUCKET_ID,
        "Portfolio Uploads",
        [Permission.read(Role.any())],
        false, // fileSecurity
        true, // enabled
        50 * 1024 * 1024, // 50MB
        [] // allowedExtensions (empty = allow all)
      );
      console.log("✅ Successfully updated Appwrite storage bucket file limit to 50MB!");
    } catch (err) {
      if (err.code === 404) {
        console.log("Bucket not found. Creating new bucket...");
        bucket = await storage.createBucket(
          BUCKET_ID,
          "Portfolio Uploads",
          [Permission.read(Role.any())],
          false, // fileSecurity
          true, // enabled
          50 * 1024 * 1024, // 50MB
          [] // allowedExtensions
        );
        console.log("✅ Successfully created Appwrite storage bucket with 50MB limit!");
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("❌ Storage bucket setup failed:", err);
  }
}

run();
