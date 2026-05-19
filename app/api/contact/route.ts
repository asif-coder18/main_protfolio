import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { getDatabases, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Data validation and sanitization complete. Proceed to persistence.

    // 1. Save to Appwrite (Primary)
    let savedToDb = false;
    let dbError = "";
    try {
      const db = getDatabases();
      await db.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), {
        name,
        email,
        subject: subject || "No Subject",
        message,
        read: false,
        // Removed manual createdAt to avoid schema conflicts
      });
      savedToDb = true;
    } catch (err: any) {
      dbError = err.message || "Unknown database error";
      console.error("Appwrite Save Error:", dbError);
    }

    // 2. Send Email via Nodemailer (Notification)
    let emailSent = false;
    let mailError = "";
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Resend free tier: must send FROM onboarding@resend.dev
        // and TO the email address verified on your Resend account.
        const { data, error } = await resend.emails.send({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: [process.env.CONTACT_EMAIL || "maulaasiful@gmail.com"],
          replyTo: email,
          subject: `[Portfolio] New message from ${name}: ${subject}`,
          html: emailHtml,
        });

        if (error) {
          mailError = error.message;
          console.error("Resend delivery failed:", JSON.stringify(error));
        } else {
          emailSent = true;
          console.log("Email sent successfully. Resend ID:", data?.id);
        }
      } else {
        mailError = "Neither EMAIL_PASS nor RESEND_API_KEY is set.";
        console.warn(mailError);
      }
    } catch (err: any) {
      mailError = err.message || "Email service failed.";
      console.error("Email Delivery Error:", mailError);
    }

    // Success if at least saved to DB
    if (savedToDb) {
      return NextResponse.json({ 
        success: true, 
        message: emailSent ? "Message received & Email sent!" : `Message received! (Email error: ${mailError})`
      });
    }

    // If DB failed, it's a real error
    return NextResponse.json({ 
      error: `Could not save message: ${dbError}. ${mailError ? "Also: " + mailError : ""}` 
    }, { status: 500 });

  } catch (error: any) {
    console.error("Contact System Failure:", error.message || error);
    return NextResponse.json({ error: error.message || "Failed to process message." }, { status: 500 });
  }
}
