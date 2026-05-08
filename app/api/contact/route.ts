import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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

    // 2. Send Email via Resend (Notification)
    let emailSent = false;
    let mailError = "";
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
          from: "Portfolio Contact <onboarding@resend.dev>",
          to: ["maulaasiful@gmail.com"],
          replyTo: email,
          subject: `Portfolio: ${subject}`,
          html: `
            <div style="font-family: sans-serif; padding: 30px; border: 1px solid #f0f0f0; border-radius: 16px; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
              <h2 style="color: #6366f1; margin-top: 0;">New Portfolio Message</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 0 0 10px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
              </div>
              <div style="line-height: 1.6; white-space: pre-wrap; color: #374151;">
                ${message}
              </div>
              <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 30px 0;" />
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                Sent at: ${new Date().toLocaleString()} · Reply to this email to contact the sender
              </p>
            </div>
          `,
        });

        if (error) {
          mailError = error.message;
          console.error("Resend delivery failed:", error);
        } else {
          emailSent = true;
          console.log("Resend email sent successfully:", data?.id);
        }
      } else {
        mailError = "Email key missing (RESEND_API_KEY).";
        console.warn(mailError);
      }
    } catch (err: any) {
      mailError = err.message || "Email service failed.";
      console.error("Resend Critical Error:", mailError);
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
