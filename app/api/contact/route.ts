import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.office365.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const ADMIN_EMAIL = "erp.admin@optimizedholding.com.qa";

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      email,
      service,
      vehicleMake,
      vehicleModel,
      message,
    } = body;

    console.log("=================================");
    console.log("AJDAL AUTOMOTIVE CONTACT REQUEST");
    console.log("=================================");
    console.log("Customer:", name);
    console.log("Phone:", phone);
    console.log("Email:", email);
    console.log("Service:", service);
    console.log("Vehicle:", vehicleMake, vehicleModel);
    console.log("Recipient:", ADMIN_EMAIL);
    console.log("=================================");

    // Check SMTP configuration
    if (!SMTP_USER || !SMTP_PASSWORD) {
      console.error("SMTP_USER or SMTP_PASSWORD is missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Email server configuration is missing.",
        },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!name || !phone || !service || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields.",
        },
        { status: 400 }
      );
    }

    // Verify SMTP connection
    console.log("Checking Microsoft 365 SMTP connection...");

    await transporter.verify();

    console.log("SMTP connection successful.");

    // Send email
    console.log(`Sending email to ${ADMIN_EMAIL}...`);

    const info = await transporter.sendMail({
      from: `"Ajdal Automotive Website" <${SMTP_USER}>`,

      to: ADMIN_EMAIL,

      replyTo: email || SMTP_USER,

      subject: `New Quote Request - ${service}`,

      text: `
New Quote Request - Ajdal Automotive

Customer Information
--------------------

Name: ${name}
Phone: ${phone}
Email: ${email || "Not provided"}

Service: ${service}

Vehicle Make: ${vehicleMake || "Not provided"}
Vehicle Model: ${vehicleModel || "Not provided"}

Required Work
-------------

${message}
      `,

      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>New Quote Request</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f5f0ea;
    font-family: Arial, Helvetica, sans-serif;
  "
>

  <div
    style="
      max-width: 700px;
      margin: 40px auto;
      background-color: #ffffff;
    "
  >

    <!-- Header -->

    <div
      style="
        background-color: #0f4545;
        padding: 30px;
      "
    >

      <h1
        style="
          margin: 0;
          color: #bd9872;
          font-size: 28px;
        "
      >
        New Quote Request
      </h1>

      <p
        style="
          margin: 8px 0 0;
          color: #ffffff;
          font-size: 14px;
        "
      >
        Ajdal Automotive
      </p>

    </div>

    <!-- Main Content -->

    <div
      style="
        padding: 30px;
        background-color: #f5f0ea;
      "
    >

      <h2
        style="
          margin-top: 0;
          color: #0f4545;
          font-size: 20px;
        "
      >
        Customer Information
      </h2>

      <table
        style="
          width: 100%;
          border-collapse: collapse;
          background-color: #ffffff;
        "
      >

        <tr>
          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
              font-weight: bold;
              width: 35%;
            "
          >
            Name
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
            "
          >
            ${escapeHtml(String(name))}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
              font-weight: bold;
            "
          >
            Phone
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
            "
          >
            ${escapeHtml(String(phone))}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
              font-weight: bold;
            "
          >
            Customer Email
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
            "
          >
            ${escapeHtml(String(email || "Not provided"))}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
              font-weight: bold;
            "
          >
            Requested Service
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
            "
          >
            ${escapeHtml(String(service))}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
              font-weight: bold;
            "
          >
            Vehicle Make
          </td>

          <td
            style="
              padding: 12px;
              border-bottom: 1px solid #eeeeee;
            "
          >
            ${escapeHtml(String(vehicleMake || "Not provided"))}
          </td>
        </tr>

        <tr>
          <td
            style="
              padding: 12px;
              font-weight: bold;
            "
          >
            Vehicle Model
          </td>

          <td
            style="
              padding: 12px;
            "
          >
            ${escapeHtml(String(vehicleModel || "Not provided"))}
          </td>
        </tr>

      </table>

      <!-- Required Work -->

      <h2
        style="
          margin-top: 30px;
          color: #0f4545;
          font-size: 20px;
        "
      >
        Required Work
      </h2>

      <div
        style="
          background-color: #ffffff;
          padding: 20px;
          border-left: 4px solid #bd9872;
          line-height: 1.6;
          color: #444444;
        "
      >
        ${escapeHtml(String(message)).replace(/\n/g, "<br />")}
      </div>

    </div>

    <!-- Footer -->

    <div
      style="
        background-color: #0f4545;
        padding: 20px;
        text-align: center;
        color: #ffffff;
        font-size: 12px;
      "
    >
      Ajdal Automotive
    </div>

  </div>

</body>
</html>
      `,
    });

    console.log("=================================");
    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("=================================");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Response:", info.response);
    console.log("Recipient:", ADMIN_EMAIL);
    console.log("=================================");

    return NextResponse.json({
      success: true,
      message: "Request sent successfully.",
    });
  } catch (error) {
    console.error("=================================");
    console.error("EMAIL SENDING ERROR");
    console.error("=================================");
    console.error(error);
    console.error("=================================");

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email.",
      },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}