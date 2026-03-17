const cron    = require('node-cron');
const crypto  = require('crypto');
const prisma  = require('./prismaClient');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// Get current IST time as HH:MM string
function getISTTime() {
  const now = new Date();
  // IST = UTC + 5:30
  const istOffset = 5 * 60 + 30;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (istOffset * 60000));
  const hh  = String(ist.getHours()).padStart(2, '0');
  const mm  = String(ist.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Get today's date string YYYY-MM-DD in IST
function getISTDateString() {
  const now = new Date();
  const istOffset = 5 * 60 + 30;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + (istOffset * 60000));
  return ist.toISOString().split('T')[0];
}

async function sendMedicineReminder({ to, patientName, medicineName, dosage, frequency, token }) {
  const takenUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/prescriptions/taken?token=${token}`;

  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F0F7FF; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0B2545, #1a3a6e); padding: 32px 40px; text-align: center;">
        <h1 style="color: #0DC4A1; font-size: 24px; margin: 0 0 4px;">MediConnect</h1>
        <p style="color: rgba(255,255,255,0.5); margin: 0; font-size: 12px;">Medicine Reminder</p>
      </div>

      <div style="padding: 32px 40px; background: #fff;">
        <h2 style="color: #0B2545; font-size: 18px; margin: 0 0 8px;">Time for your medicine, ${patientName}! 💊</h2>
        <p style="color: #64748B; font-size: 14px; line-height: 1.65; margin: 0 0 24px;">
          This is a reminder to take your medicine as prescribed.
        </p>

        <div style="background: #F0F7FF; border-radius: 12px; padding: 20px 24px; border: 1px solid rgba(11,37,69,0.08); margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">Your Medicine</p>
          <p style="font-size: 20px; font-weight: 800; color: #0B2545; margin: 8px 0 4px;">${medicineName}</p>
          <p style="font-size: 13px; color: #64748B; margin: 0;">${dosage} &nbsp;·&nbsp; ${frequency}</p>
        </div>

        <a href="${takenUrl}"
           style="display: block; text-align: center; background: linear-gradient(135deg, #0DC4A1, #09A888); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; margin-bottom: 16px;">
          ✅ Mark as Taken
        </a>

        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
          This link expires in 24 hours. Do not share it with others.
        </p>
      </div>

      <div style="padding: 16px 40px; background: #F8FAFC; border-top: 1px solid rgba(11,37,69,0.06);">
        <p style="margin: 0; font-size: 11px; color: #94A3B8; text-align: center;">
          MediConnect — Connecting Patients with Trusted Doctors across India
        </p>
      </div>
    </div>`;

  await transporter.sendMail({
    from:    `"MediConnect Reminders" <${process.env.EMAIL_USER}>`,
    to,
    subject: `💊 Reminder: Take your ${medicineName} now`,
    html
  });
}

async function runReminderJob() {
  const currentTime = getISTTime();
  const todayDate   = getISTDateString();

  console.log(`[Reminder Cron] Running at IST ${currentTime}`);

  try {
    // Fetch all prescriptions that have this current hour in reminderTimes
    const prescriptions = await prisma.prescription.findMany({
      where: {
        reminderTimes: { has: currentTime }
      },
      include: {
        patient: { include: { user: true } }
      }
    });

    if (prescriptions.length === 0) {
      console.log(`[Reminder Cron] No prescriptions scheduled for ${currentTime}`);
      return;
    }

    for (const prescription of prescriptions) {
      const patientEmail = prescription.patient.user.email;
      const patientName  = prescription.patient.user.name;
      const medicines    = Array.isArray(prescription.medicines) ? prescription.medicines : [];
      const existingLog  = Array.isArray(prescription.medicineLog) ? prescription.medicineLog : [];

      const newLogEntries = [];

      for (const medicine of medicines) {
        const medicineName = medicine.name;

        // Check if we already sent a reminder for this medicine today
        const alreadySent = existingLog.some(
          e => e.medicineName === medicineName && e.date === todayDate
        );

        if (alreadySent) continue;

        // Generate unique token
        const token     = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        newLogEntries.push({
          token,
          medicineName,
          date:      todayDate,
          taken:     false,
          expiresAt,
          sentAt:    new Date().toISOString()
        });

        // Send reminder email
        try {
          await sendMedicineReminder({
            to:          patientEmail,
            patientName,
            medicineName,
            dosage:      medicine.dosage      || '',
            frequency:   medicine.frequency   || '',
            token
          });
          console.log(`[Reminder Cron] Sent reminder for ${medicineName} to ${patientEmail}`);
        } catch (emailError) {
          console.error(`[Reminder Cron] Failed to send email to ${patientEmail}:`, emailError.message);
        }
      }

      if (newLogEntries.length > 0) {
        // Append new log entries to the prescription
        await prisma.prescription.update({
          where: { id: prescription.id },
          data:  { medicineLog: [...existingLog, ...newLogEntries] }
        });
      }
    }

    console.log(`[Reminder Cron] Processed ${prescriptions.length} prescriptions at ${currentTime}`);

  } catch (error) {
    console.error('[Reminder Cron] Error:', error);
  }
}

// Start cron — runs every hour at :00
// Only start if not on Vercel (serverless environment)
function startReminderCron() {
  if (process.env.VERCEL) {
    console.log('[Reminder Cron] Skipping cron — running on Vercel (serverless)');
    return;
  }

  // Run at the top of every hour  
  cron.schedule('0 * * * *', runReminderJob, {
    timezone: 'Asia/Kolkata'
  });

  console.log('[Reminder Cron] Started — will run every hour (IST)');
}

module.exports = { startReminderCron };
