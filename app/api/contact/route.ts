import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getDatabases, DATABASE_ID, COLLECTIONS, ID } from "@/lib/appwrite";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send email via Resend
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: "maulaasiful@gmail.com",
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f0f1a; color: #f0f0f5; border-radius: 12px;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
            <h1 style="margin: 0; font-size: 22px; color: #818cf8;">New Message from Portfolio</h1>
            ${subject.toLowerCase().includes('hire') || subject.toLowerCase().includes('contract') || subject.toLowerCase().includes('project') 
              ? '<span style="background: #ef4444; color: white; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Hiring Interest</span>' 
              : ''}
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #9ca3af; font-size: 13px; width: 80px; vertical-align: top;">FROM</td>
              <td style="padding: 10px 0; font-weight: 600; color: #f0f0f5;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #9ca3af; font-size: 13px; vertical-align: top;">EMAIL</td>
              <td style="padding: 10px 0;">
                <a href="mailto:${email}" style="color: #818cf8; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #9ca3af; font-size: 13px; vertical-align: top;">SUBJECT</td>
              <td style="padding: 10px 0; color: #f0f0f5;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding: 20px; background: #1a1a2e; border-radius: 8px; border-left: 3px solid #6366f1;">
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">MESSAGE</p>
            <p style="margin: 0; color: #f0f0f5; line-height: 1.7; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center;">
            Sent via your portfolio contact form · Reply directly to this email to respond to ${name}
          </p>
        </div>
      `,
    });

    // Save to Appwrite
    try {
      const db = getDatabases();
      await db.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), {
        name,
        email,
        subject,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.error("Failed to save message to Appwrite:", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
