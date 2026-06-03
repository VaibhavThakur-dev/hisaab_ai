import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  await transporter.sendMail({
    from: `"HisaabAI" <${process.env.SMTP_FROM}>`,
    to,
    subject: `${otp} — your HisaabAI verification code`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#FF9500;border-radius:14px;font-size:28px;font-weight:800;color:#1C1C1E;">₹</div>
          <h2 style="margin:12px 0 0;font-size:20px;font-weight:700;color:#1C1C1E;">HisaabAI</h2>
        </div>

        <p style="font-size:15px;color:#333;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 28px;">
          Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.
        </p>

        <div style="text-align:center;margin:0 0 28px;">
          <div style="display:inline-block;background:#FFF5E6;border:2px solid #FF9500;border-radius:12px;padding:18px 40px;">
            <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#FF9500;">${otp}</span>
          </div>
        </div>

        <p style="font-size:13px;color:#888;line-height:1.6;margin:0 0 16px;">
          Never share this code with anyone. HisaabAI will never ask for it.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
        <p style="font-size:12px;color:#bbb;margin:0;">
          If you didn't create a HisaabAI account, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
