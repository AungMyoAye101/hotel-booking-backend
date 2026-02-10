import dotenv from "dotenv";
import { Resend } from "resend";
import { IPaymentType } from "../models/payment.model";
dotenv.config()
const api_key = process.env.RESEND_API_KEY;
if (!api_key) {
    throw new Error("Resend api key is required.");
}

export const resend = new Resend(api_key);

export const sendPaymentEmail = async (to: string, subject: string, text: string, payment: IPaymentType) => {
    try {
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: to,
            subject: subject,
            text: text,
            html: `<body style="margin:0; padding:0; background-color:#f5f7fb; font-family: Arial, Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <!-- Card -->
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#2563eb; padding:20px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:22px;">
                  Booking
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 12px; color:#111827;">
                  Payment Successful 🎉
                </h2>

                <p style="margin:0 0 24px; color:#4b5563; font-size:14px; line-height:1.6;">
                  Thank you for your payment. Your booking has been confirmed successfully.
                </p>

                <!-- Info Table -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:8px 0; color:#6b7280;">Payment ID</td>
                    <td align="right" style="padding:8px 0; font-weight:600; color:#111827;">
                      ${payment._id}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; color:#6b7280;">Payment Method</td>
                    <td align="right" style="padding:8px 0; font-weight:600; color:#111827;">
                      ${payment.paymentMethod}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; color:#6b7280;">Amount Paid</td>
                    <td align="right" style="padding:8px 0; font-weight:600; color:#111827;">
                      ${payment.amount} $
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0; color:#6b7280;">Status</td>
                    <td align="right" style="padding:8px 0; font-weight:600; color:#16a34a;">
                      ${payment.status}
                    </td>
                  </tr>
                </table>

            
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px; background:#f9fafb; text-align:center; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} Booking. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>`,
        })
        return response.data;
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to send email.");
    }
}

