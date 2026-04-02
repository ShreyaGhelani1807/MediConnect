const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

const ensureEmailConfig = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email service not configured. Set EMAIL_USER and EMAIL_PASS (app password).');
  }
};

// ── Approval Email ─────────────────────────────────────────
const sendApprovalEmail = async ({ to, doctorName, mediconnectEmail, password }) => {
  const mailOptions = {
    from:    `"MediConnect" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🎉 Your MediConnect Doctor Account Has Been Approved!',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F0F7FF; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0B2545, #1a3a6e); padding: 36px 40px; text-align: center;">
          <h1 style="color: #0DC4A1; font-size: 26px; margin: 0 0 6px;">MediConnect</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">Doctor Verification Portal</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 40px; background: #fff;">
          <h2 style="color: #0B2545; font-size: 20px; margin: 0 0 12px;">Congratulations, ${doctorName}! 🎉</h2>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Your registration has been reviewed and <strong style="color: #0DC4A1;">approved</strong> by the MediConnect team.
            You can now log in to your doctor dashboard using the credentials below.
          </p>

          <!-- Credentials Box -->
          <div style="background: #F0F7FF; border-radius: 12px; padding: 24px; border: 1px solid rgba(11,37,69,0.1); margin-bottom: 24px;">
            <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</p>
            <div style="margin-top: 16px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748B;">📧 <strong>Email:</strong></p>
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #0B2545; background: #fff; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(11,37,69,0.1);">${mediconnectEmail}</p>
              <p style="margin: 0 0 8px; font-size: 13px; color: #64748B;">🔑 <strong>Password:</strong></p>
              <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0B2545; background: #fff; padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(11,37,69,0.1); letter-spacing: 0.1em;">${password}</p>
            </div>
          </div>

          <p style="color: #E8604C; font-size: 13px; font-weight: 600; margin: 0 0 24px;">
            ⚠️ Please change your password after your first login.
          </p>

          <!-- CTA -->
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
             style="display: inline-block; background: linear-gradient(135deg, #0DC4A1, #0B9E82); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Login to Dashboard →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 40px; background: #F8FAFC; border-top: 1px solid rgba(11,37,69,0.06);">
          <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
            MediConnect — Connecting Patients with Trusted Doctors across India
          </p>
        </div>
      </div>
    `
  };

  ensureEmailConfig();
  await sendMailWithTimeout(mailOptions);
};

// ── Rejection Email ────────────────────────────────────────
const sendRejectionEmail = async ({ to, doctorName, reason }) => {
  const mailOptions = {
    from:    `"MediConnect" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Update on Your MediConnect Doctor Registration',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F0F7FF; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0B2545, #1a3a6e); padding: 36px 40px; text-align: center;">
          <h1 style="color: #0DC4A1; font-size: 26px; margin: 0 0 6px;">MediConnect</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">Doctor Verification Portal</p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 40px; background: #fff;">
          <h2 style="color: #0B2545; font-size: 20px; margin: 0 0 12px;">Dear ${doctorName},</h2>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Thank you for registering on MediConnect. After reviewing your application,
            we were unable to approve your account at this time.
          </p>

          <!-- Reason Box -->
          <div style="background: rgba(232,96,76,0.05); border-radius: 12px; padding: 20px 24px; border: 1px solid rgba(232,96,76,0.2); margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #E8604C; text-transform: uppercase; letter-spacing: 0.05em;">Reason for Rejection</p>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${reason}</p>
          </div>

          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            If you believe this is an error or would like to resubmit with corrected documents,
            please register again with the updated information.
          </p>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/register"
             style="display: inline-block; background: linear-gradient(135deg, #0B2545, #1a3a6e); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Re-apply →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 40px; background: #F8FAFC; border-top: 1px solid rgba(11,37,69,0.06);">
          <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
            MediConnect — Connecting Patients with Trusted Doctors across India
          </p>
        </div>
      </div>
    `
  };

  ensureEmailConfig();
  await sendMailWithTimeout(mailOptions);
};

// ── Forgot Password Email ──────────────────────────────────
const sendForgotPasswordEmail = async ({ to, name, tempPassword }) => {
  const mailOptions = {
    from:    `"MediConnect" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🔑 Your MediConnect Temporary Password',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #F0F7FF; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0B2545, #1a3a6e); padding: 36px 40px; text-align: center;">
          <h1 style="color: #0DC4A1; font-size: 26px; margin: 0 0 6px;">MediConnect</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 13px;">Password Reset</p>
        </div>
        <div style="padding: 36px 40px; background: #fff;">
          <h2 style="color: #0B2545; font-size: 20px; margin: 0 0 12px;">Hello, ${name}</h2>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your MediConnect password. Use the temporary password below to log in, then change it immediately.
          </p>
          <div style="background: #F0F7FF; border-radius: 12px; padding: 24px; border: 1px solid rgba(11,37,69,0.1); margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Temporary Password</p>
            <p style="margin: 0; font-size: 22px; font-weight: 900; color: #0B2545; letter-spacing: 0.15em; background: #fff; padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(11,37,69,0.1); text-align: center;">${tempPassword}</p>
          </div>
          <p style="color: #E8604C; font-size: 13px; font-weight: 600; margin: 0 0 24px;">
            ⚠️ This is a temporary password. Please change it after logging in.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
             style="display: inline-block; background: linear-gradient(135deg, #0DC4A1, #0B9E82); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Login to MediConnect →
          </a>
          <p style="color: #94A3B8; font-size: 12px; margin: 24px 0 0; line-height: 1.6;">
            If you did not request a password reset, please ignore this email. Your account remains secure.
          </p>
        </div>
        <div style="padding: 20px 40px; background: #F8FAFC; border-top: 1px solid rgba(11,37,69,0.06);">
          <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
            MediConnect — Connecting Patients with Trusted Doctors across India
          </p>
        </div>
      </div>
    `
  };
  ensureEmailConfig();
  await sendMailWithTimeout(mailOptions);
};

const sendMailWithTimeout = async (mailOptions) => {
  const timeoutMs = Number(process.env.EMAIL_TIMEOUT_MS || 20000);
  return Promise.race([
    transporter.sendMail(mailOptions),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email send timeout')), timeoutMs)
    ),
  ]);
};

module.exports = { sendApprovalEmail, sendRejectionEmail, sendForgotPasswordEmail };