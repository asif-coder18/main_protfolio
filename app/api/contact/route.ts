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
      const emailUser = process.env.EMAIL_USER || process.env.CONTACT_EMAIL || "maulaasiful@gmail.com";
      const emailPass = process.env.EMAIL_PASS;

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#6366f1;font-size:22px;margin:0;">📬 New Portfolio Message</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:10px 14px;background:#f8fafc;border-radius:8px 8px 0 0;border-bottom:1px solid #e5e7eb;">
                <strong style="color:#374151;">From:</strong>
                <span style="color:#6366f1;margin-left:8px;">${name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e5e7eb;">
                <strong style="color:#374151;">Email:</strong>
                <a href="mailto:${email}" style="color:#6366f1;margin-left:8px;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#f8fafc;border-radius:0 0 8px 8px;">
                <strong style="color:#374151;">Subject:</strong>
                <span style="color:#374151;margin-left:8px;">${subject}</span>
              </td>
            </tr>
          </table>
          <div style="background:#f8fafc;padding:20px;border-radius:12px;border-left:4px solid #6366f1;margin-bottom:24px;">
            <p style="margin:0;color:#374151;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          <div style="text-align:center;padding:16px;background:#f0f0ff;border-radius:12px;">
            <p style="margin:0;font-size:13px;color:#6366f1;">
              💡 Hit <strong>Reply</strong> to respond directly to ${name}
            </p>
          </div>
          <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:20px;">
            Sent via your portfolio contact form · ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
      `;

      if (emailPass) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        await transporter.sendMail({
          from: `"Portfolio Contact" <${emailUser}>`,
          to: emailUser,
          replyTo: email,
          subject: `[Portfolio] New message from ${name}: ${subject}`,
          html: emailHtml,
        });

        emailSent = true;
        console.log("Email sent successfully via Nodemailer.");
      } else if (process.env.RESEND_API_KEY) {
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
