import { Client, Databases } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69fc9801002376d91970";
const API_KEY = process.env.APPWRITE_API_KEY || "standard_b7338cde001c1775d05adf125eb4596abb119c9c7089c1726a8b354306f8c9a77da1408692182aa5d5df5a9063f6c75b0411a47ca6721c7dc62d0e736680c6de7937998922096bb32877c909c6be26deaa72c2c463df55611f45fd29bf2a73fe4b8c485c3b5ad3bbd6cec282afd6e7c84f534eb4b34bf142d2de8e1593bd92f1";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "69fc991e002fe5327e37";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function run() {
  try {
    console.log("Adding 'favicon' attribute to brand_settings collection...");
    await databases.createStringAttribute(DATABASE_ID, "brand_settings", "favicon", 1000, false, "");
    console.log("✅ Successfully added 'favicon' attribute to brand_settings!");
  } catch (err) {
    if (err.code === 409) {
      console.log("~ 'favicon' attribute already exists in brand_settings.");
    } else {
      console.error("❌ Failed to create favicon attribute:", err);
    }
  }
}

run();
