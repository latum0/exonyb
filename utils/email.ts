import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Exony" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Vérifiez votre email",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; color: #333333;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
        <img src="http://localhost:3001/public/exony-logo.png" alt="Exony Logo" width="180" style="margin-bottom: 10px;">
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Bienvenue chez Exony!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; line-height: 1.6;">
              <p style="margin: 0; font-size: 16px;">Bonjour,</p>
              <p style="margin: 15px 0 0; font-size: 16px;">Un compte a été créé pour vous sur la plateforme Exony. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous:</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 0 30px; text-align: center;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 30px; background-color:#ff7f00 ; color: #ffffff; text-decoration: none; font-weight: 500; border-radius: 4px; font-size: 16px;">Vérifier mon email</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; line-height: 1.6;">
              <p style="margin: 0; font-size: 16px;">Si vous n'avez pas demandé ce compte, vous pouvez ignorer cet email.</p>
            
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center; background-color: #f5f5f5; border-radius: 0 0 8px 8px; border-top: 1px solid #eeeeee;">
        <p style="margin: 0; font-size: 14px; color: #666666;">© 2024 Exony. Tous droits réservés.</p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #666666;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
export async function sendResetPasswordEmail(email: string, token: string) {
  const verificationUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Exony" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Réinitialisation de mot de passe",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; color: #333333;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #1a1a1a; border-radius: 8px 8px 0 0;">
        <img src="http://localhost:3001/public/exony-logo.png" alt="Exony Logo" width="180" style="margin-bottom: 10px;">
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Bienvenue chez Exony!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; line-height: 1.6;">
              <p style="margin: 0; font-size: 16px;">Bonjour,</p>
              <p style="margin: 15px 0 0; font-size: 16px;">Pour réinitialiser votre mot de passe, veuillez cliquer sur le bouton ci-dessous:</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 0 30px; text-align: center;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 30px; background-color:#ff7f00 ; color: #ffffff; text-decoration: none; font-weight: 500; border-radius: 4px; font-size: 16px;">Vérifier mon email</a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 20px; line-height: 1.6;">
              <p style="margin: 0; font-size: 16px;">Si vous n'avez pas demandé cette action, vous pouvez ignorer cet email.</p>
            
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; text-align: center; background-color: #f5f5f5; border-radius: 0 0 8px 8px; border-top: 1px solid #eeeeee;">
        <p style="margin: 0; font-size: 14px; color: #666666;">© 2024 Exony. Tous droits réservés.</p>
        <p style="margin: 10px 0 0; font-size: 14px; color: #666666;">Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
