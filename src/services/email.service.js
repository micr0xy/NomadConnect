const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const smtpService = process.env.SMTP_SERVICE;

  if (!smtpUser || !smtpPass || (!smtpHost && !smtpService)) {
    throw new Error('Email service is not configured. Set SMTP credentials in environment variables.');
  }

  const transportConfig = smtpService
    ? {
        service: smtpService,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }
    : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
};

const sendForgotPasswordEmail = async ({ toEmail, temporaryPassword, userName = 'Traveler' }) => {
  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;

  const subject = 'NOMAD CONNECT - Your new temporary password';
  const text = `Hi ${userName},\n\nYour password has been reset.\n\nTemporary password: ${temporaryPassword}\n\nPlease log in and change your password immediately.\n\n- NOMAD CONNECT`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #102513; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">NOMAD CONNECT</h2>
      <p>Hi ${userName},</p>
      <p>Your password has been reset successfully.</p>
      <p style="margin: 14px 0;">
        <strong>Temporary password:</strong>
        <span style="display: inline-block; background: #f2f7f3; border: 1px solid #c8ddcc; border-radius: 6px; padding: 6px 10px; margin-left: 6px; letter-spacing: 0.3px;">${temporaryPassword}</span>
      </p>
      <p>Please log in and change your password immediately.</p>
      <p style="margin-top: 20px; color: #36533b;">- NOMAD CONNECT Team</p>
    </div>
  `;

  const mailer = getTransporter();
  await mailer.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendForgotPasswordEmail,
};
