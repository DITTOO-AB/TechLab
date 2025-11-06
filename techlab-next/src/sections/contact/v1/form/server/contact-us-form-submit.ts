'use server';

import nodemailer from 'nodemailer';
import { ContactUsSchemaType } from '..';

export async function contactUsFormSubmit(values: ContactUsSchemaType) {
  const { name, email, subject, message, phone } = values;

  try {
    // Rackspace SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.RACKSPACE_SMTP_HOST || 'secure.emailsrvr.com',
      port: Number(process.env.RACKSPACE_SMTP_PORT || 465),
      secure: (process.env.RACKSPACE_SMTP_PORT || '465') === '465', // true for SSL
      auth: {
        user: process.env.RACKSPACE_SMTP_USER!,
        pass: process.env.RACKSPACE_SMTP_PASS!,
      },
      tls: { rejectUnauthorized: true },
    });

    // Keep FROM on your Rackspace domain (for SPF/DKIM)
    const fromEmail = process.env.MAIL_FROM || process.env.RACKSPACE_SMTP_USER!;
    const toEmail   = process.env.MAIL_TO   || process.env.RACKSPACE_SMTP_USER!;

    const mailOptions = {
      from: `"${name}" <${fromEmail}>`,
      to: toEmail,
      replyTo: `${name} <${email}>`,
      subject: subject || 'New contact message',
      html: `
        <h3 style="margin-bottom:8px;">New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error('Rackspace send error:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}
