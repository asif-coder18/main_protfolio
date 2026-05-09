/**
 * Appwrite Collection Setup Script
 * Run once to create all required collections and attributes.
 * Usage: npx tsx lib/appwrite-setup.ts
 */

import { Client, Databases, Storage, Permission, Role } from "node-appwrite";

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69fc9801002376d91970";
const API_KEY = process.env.APPWRITE_API_KEY || "standard_b7338cde001c1775d05adf125eb4596abb119c9c7089c1726a8b354306f8c9a77da1408692182aa5d5df5a9063f6c75b0411a47ca6721c7dc62d0e736680c6de7937998922096bb32877c909c6be26deaa72c2c463df55611f45fd29bf2a73fe4b8c485c3b5ad3bbd6cec282afd6e7c84f534eb4b34bf142d2de8e1593bd92f1";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "69fc991e002fe5327e37";
const BUCKET_ID = "portfolio_uploads";

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);

// Permissions: anyone can read, only server (API key) can write
const anyoneRead = [Permission.read(Role.any())];
const anyoneReadServerWrite = [Permission.read(Role.any())];

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createAttr(fn: () => Promise<unknown>, label: string) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
  } catch (e: unknown) {
    const err = e as { code?: number; message?: string };
    if (err?.code === 409) {
      console.log(`  ~ ${label} (already exists)`);
    } else {
      console.error(`  ✗ ${label}: ${err?.message}`);
    }
  }
  await sleep(300);
}

async function createCollection(id: string, name: string) {
  try {
    await databases.createCollection(DATABASE_ID, id, name, anyoneRead);
    console.log(`\n✓ Created collection: ${name}`);
  } catch (e: unknown) {
    const err = e as { code?: number; message?: string };
    if (err?.code === 409) {
      console.log(`\n~ Collection exists: ${name}`);
    } else {
      throw e;
    }
  }
  await sleep(500);
}

async function setup() {
  console.log("🚀 Setting up Appwrite collections...\n");

  // ── Storage Bucket ──────────────────────────────────────────────────────────
  try {
    await storage.createBucket(BUCKET_ID, "Portfolio Uploads", [Permission.read(Role.any())], false, undefined, 5 * 1024 * 1024, ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
    console.log("✓ Created storage bucket: portfolio_uploads");
  } catch (e: unknown) {
    const err = e as { code?: number };
    if (err?.code === 409) console.log("~ Storage bucket already exists");
    else throw e;
  }

  // ── ABOUT ───────────────────────────────────────────────────────────────────
  await createCollection("about", "About");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "name", 255, true), "name");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "greeting", 255, false, "Hi there, I'm"), "greeting");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "title", 255, true), "title");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "subtitle", 255, false, ""), "subtitle");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "location", 255, false, ""), "location");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "bio", 10000, false, "[]"), "bio");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "tagline", 1000, false, ""), "tagline");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "profileImage", 1000, false, "/profile.jpg"), "profileImage");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "profileImage2", 1000, false, "/profile1.jpg"), "profileImage2");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "about", "availableForWork", false, true), "availableForWork");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "resumeUrl", 1000, false, ""), "resumeUrl");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "githubUrl", 1000, false, ""), "githubUrl");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "linkedinUrl", 1000, false, ""), "linkedinUrl");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "emailAddress", 255, false, ""), "emailAddress");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "stats", 10000, false, "[]"), "stats");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "highlights", 10000, false, "[]"), "highlights");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "floatingBadge1", 255, false, "Next.js Dev"), "floatingBadge1");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "floatingBadge2", 255, false, "Clean UI"), "floatingBadge2");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "about", "statusBadge", 255, false, "Open to opportunities"), "statusBadge");

  // ── ADMIN ───────────────────────────────────────────────────────────────────
  await createCollection("admin", "Admin");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "admin", "username", 255, true), "username");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "admin", "passwordHash", 255, true), "passwordHash");

  // ── CONTACT INFO ─────────────────────────────────────────────────────────────
  await createCollection("contact_info", "Contact Info");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "contact_info", "email", 255, false, ""), "email");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "contact_info", "phone", 50, false, ""), "phone");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "contact_info", "address", 500, false, ""), "address");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "contact_info", "responseTime", 255, false, "Usually responds within 24 hours"), "responseTime");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "contact_info", "availableForWork", false, true), "availableForWork");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "contact_info", "socialLinks", 10000, false, "[]"), "socialLinks");

  // ── EXPERIENCE ───────────────────────────────────────────────────────────────
  await createCollection("experience", "Experience");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "type", 20, false, "work"), "type");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "title", 255, true), "title");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "company", 255, true), "company");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "location", 255, false, ""), "location");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "period", 100, false, ""), "period");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "description", 5000, false, ""), "description");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "tags", 5000, false, "[]"), "tags");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "experience", "keyFocus", 5000, false, "[]"), "keyFocus");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "experience", "current", false, false), "current");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "experience", "order", false, 0), "order");

  // ── MESSAGES ─────────────────────────────────────────────────────────────────
  await createCollection("messages", "Messages");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "messages", "name", 255, true), "name");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "messages", "email", 255, true), "email");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "messages", "subject", 500, false, ""), "subject");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "messages", "message", 10000, true), "message");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "messages", "read", false, false), "read");
  await createAttr(() => databases.createDatetimeAttribute(DATABASE_ID, "messages", "createdAt", false), "createdAt");

  // ── PROJECTS ─────────────────────────────────────────────────────────────────
  await createCollection("projects", "Projects");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "title", 255, true), "title");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "description", 5000, false, ""), "description");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "image", 10, false, "🚀"), "image");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "imageUrl", 1000, false, ""), "imageUrl");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "gradient", 500, false, "from-indigo-500/20 via-purple-500/10 to-transparent"), "gradient");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "tags", 5000, false, "[]"), "tags");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "live", 1000, false, ""), "live");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "projects", "github", 1000, false, ""), "github");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "projects", "featured", false, false), "featured");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "projects", "stars", false, 0), "stars");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "projects", "order", false, 0), "order");

  // ── SKILL CATEGORIES ─────────────────────────────────────────────────────────
  await createCollection("skill_categories", "Skill Categories");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "skill_categories", "title", 255, true), "title");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "skill_categories", "color", 50, false, "indigo"), "color");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "skill_categories", "order", false, 0), "order");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "skill_categories", "skills", 10000, false, "[]"), "skills");

  // ── TECH ICONS ───────────────────────────────────────────────────────────────
  await createCollection("tech_icons", "Tech Icons");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "tech_icons", "name", 255, true), "name");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "tech_icons", "symbol", 50, true), "symbol");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "tech_icons", "bg", 100, false, "bg-indigo-500/10"), "bg");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "tech_icons", "text", 100, false, "text-indigo-400"), "text");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "tech_icons", "order", false, 0), "order");

  // ── LOADER SETTINGS ──────────────────────────────────────────────────────────
  await createCollection("loader_settings", "Loader Settings");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "name", 255, true), "name");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "title", 255, false, "Asiful Maula Abir"), "title");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "subtitle", 255, false, "Frontend Developer"), "subtitle");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "subtitleColor", 50, false, "#9ca3af"), "subtitleColor");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "subtitleSize", 20, false, "sm"), "subtitleSize");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "subtitleWeight", 20, false, "normal"), "subtitleWeight");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "imageUrl", 1000, false, "/profile.jpg"), "imageUrl");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "loaderType", 50, false, "progress-bar"), "loaderType");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "progressColor", 50, false, "#8b5cf6"), "progressColor");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "bgGradient", 500, false, ""), "bgGradient");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "backgroundStyle", 50, false, "none"), "backgroundStyle");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "imageShape", 50, false, "rounded-2xl"), "imageShape");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "loader_settings", "imageSize", false, undefined, undefined, 120), "imageSize");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "loader_settings", "duration", false, undefined, undefined, 2000), "duration");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "loader_settings", "showProgressBar", false, true), "showProgressBar");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "loader_settings", "showPercentage", false, false), "showPercentage");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "loader_settings", "allowSkip", false, false), "allowSkip");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "customCss", 5000, false, ""), "customCss");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "loader_settings", "template", 50, false, "default"), "template");
  await createAttr(() => databases.createBooleanAttribute(DATABASE_ID, "loader_settings", "isActive", false, false), "isActive");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "loader_settings", "order", false, 0), "order")

  // ── BRAND SETTINGS ──────────────────────────────────────────────────────────
  await createCollection("brand_settings", "Brand Settings");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "brand_settings", "brandName", 255, true), "brandName");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "brand_settings", "logoType", 20, false, "icon"), "logoType");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "brand_settings", "logoImage", 1000, false, ""), "logoImage");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "brand_settings", "icon", 100, false, "lucide:code-2"), "icon");
  await createAttr(() => databases.createIntegerAttribute(DATABASE_ID, "brand_settings", "logoSize", false, 32), "logoSize");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "brand_settings", "brandColor", 50, false, "#8b5cf6"), "brandColor");
  await createAttr(() => databases.createStringAttribute(DATABASE_ID, "brand_settings", "logoText", 255, false, ""), "logoText");

  console.log("\n✅ Appwrite setup complete!");
}

setup().catch(console.error);
