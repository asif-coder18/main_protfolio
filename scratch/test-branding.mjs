import { Client, Databases, Query } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69fc9801002376d91970";
const API_KEY = process.env.APPWRITE_API_KEY || "standard_b7338cde001c1775d05adf125eb4596abb119c9c7089c1726a8b354306f8c9a77da1408692182aa5d5df5a9063f6c75b0411a47ca6721c7dc62d0e736680c6de7937998922096bb32877c909c6be26deaa72c2c463df55611f45fd29bf2a73fe4b8c485c3b5ad3bbd6cec282afd6e7c84f534eb4b34bf142d2de8e1593bd92f1";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "69fc991e002fe5327e37";
const COLLECTION_ID = "brand_settings";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

async function test() {
  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(1)]);
    console.log("Existing documents count:", existing.total);

    const payload = {
      brandName: "Abir.dev",
      logoType: "icon",
      logoImage: "",
      icon: "lucide:code-2",
      logoSize: 32,
      brandColor: "#8b5cf6",
      logoText: "Abir.dev",
      favicon: "",
    };

    if (existing.total > 0) {
      console.log("Updating doc ID:", existing.documents[0].$id);
      const res = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, existing.documents[0].$id, payload);
      console.log("✅ Successfully updated doc:", res.$id);
    } else {
      console.log("Creating new doc...");
      const res = await databases.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", payload);
      console.log("✅ Successfully created doc:", res.$id);
    }
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

test();
