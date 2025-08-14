import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // For token generation
import sgMail from "@sendgrid/mail"; // For SendGrid
import UsersDAO from "../dao/UsersDAO.js";

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecretForDev';

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Professional email template
const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Qrate Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #1a73e8; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Qrate!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; color: #333333;">
              <h2 style="font-size: 20px; margin: 0 0 20px;">Verify Your Email Address</h2>
              <p style="font-size: 16px; line-height: 1.5; margin: 0 0 20px;">
                Thank you for signing up with Qrate. To complete your registration, please verify your email address by clicking the button below:
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
                <tr>
                  <td style="background-color: #1a73e8; border-radius: 4px;">
                    <a href="{{verificationLink}}" style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">Verify Email</a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 16px; line-height: 1.5; margin: 20px 0;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; word-break: break-all; margin: 0 0 20px;">
                <a href="{{verificationLink}}" style="color: #1a73e8; text-decoration: none;">{{verificationLink}}</a>
              </p>
              <p style="font-size: 16px; line-height: 1.5; margin: 0;">
                This link will expire in 1 hour for your security. If you didn’t create a Qrate account, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666666;">
              <p style="margin: 0 0 10px;">&copy; 2025 Qrate. All rights reserved.</p>
              <p style="margin: 0;">Need help? <a href="mailto:support@qrate.com" style="color: #1a73e8; text-decoration: none;">Contact Support</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default class AuthController {
  static async apiLogin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!email.endsWith("@queensu.ca")) {
      return res.status(400).json({ error: "Please use a valid @queensu.ca email address." });
    }

    try {
      const user = await UsersDAO.findUserByEmail(email);
      if (!user || user.error) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({ message: "Login successful", token, user: { email: user.email, verified: user.verified } });
    } catch (e) {
      console.error(`Login error: ${e}`);
      return res.status(500).json({ error: "An error occurred. Please try again." });
    }
  }

  static async apiRegister(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (!email.endsWith("@queensu.ca")) {
      return res.status(400).json({ error: "Please use a valid @queensu.ca email address." });
    }

    try {
      const existingUser = await UsersDAO.findUserByEmail(email);
      if (existingUser?.error) {
        throw new Error('Database error while checking user');
      }
      if (existingUser) {
        return res.status(409).json({ error: "User already exists." });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      const result = await UsersDAO.addUser(email, password, verificationToken, verificationTokenExpires);
      if (result.error) {
        throw result.error;
      }

      // Debug logs
      console.log('Using SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY || 'NOT SET');
      console.log('Using BACKEND_URL:', process.env.BACKEND_URL || 'NOT SET');

      // Send verification email with SendGrid
      const verificationLink = `${process.env.BACKEND_URL}/api/v1/auth/verify/${verificationToken}`;
      const htmlContent = emailTemplate.replace(/{{verificationLink}}/g, verificationLink);
      const msg = {
        to: email,
        from: 'noreply.qrate@gmail.com', // Verified sender in SendGrid
        subject: 'Verify Your Qrate Account',
        html: htmlContent,
      };

      try {
        const [response] = await sgMail.send(msg);
        console.log(`Verification email sent: ${response.statusCode}`);
      } catch (emailError) {
        console.error(`Email sending error: ${emailError}`);
        return res.status(500).json({ error: "Failed to send verification email. Please try again or contact support." });
      }

      // Generate JWT and send success response
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(201).json({ message: "Registration successful. Verification email sent.", token, user: { email, verified: false } });
    } catch (e) {
      console.error(`Registration error: ${e}`);
      return res.status(500).json({ error: "An error occurred. Please try again." });
    }
  }

  static async apiVerify(req, res) {
    const { token } = req.params;

    try {
      const result = await UsersDAO.verifyUser(token);
      if (result.error) {
        return res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=verification_failed`);
      }
      return res.redirect(`${process.env.FRONTEND_URL}/?verified=true`);
    } catch (e) {
      console.error(`Verification error: ${e}`);
      return res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=verification_failed`);
    }
  }

  // Temporary test method for email debugging
  static async apiTestEmail(req, res) {
    const msg = {
      to: 'noreply.qrate@gmail.com', // Test recipient
      from: 'noreply.qrate@gmail.com', // Verified sender in SendGrid
      subject: 'Test Email from qRate',
      text: 'This is a test email to verify SendGrid configuration.',
    };
    try {
      const [response] = await sgMail.send(msg);
      res.json({ success: true, message: `Email sent with status: ${response.statusCode}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}