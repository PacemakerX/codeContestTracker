// File: controllers/contactController.js
const nodemailer = require("nodemailer");

/**
 * @class ContactController
 * @description Controller class responsible for handling contact form submissions and email communications
 * @classdesc Manages the processing of contact form data, email construction, and sending using nodemailer
 * 
 * @example
 * // Example usage in a route
 * router.post('/contact', ContactController.submitContactForm);
 * 
 * @requires nodemailer
 * @requires process.env.EMAIL_USER - Gmail account username
 * @requires process.env.EMAIL_PASS - Gmail account password/app-specific password
 * @requires process.env.RECIPIENT_EMAIL - (Optional) Email address to receive contact form submissions
 * 
 * @property {Function} submitContactForm - Handles form submission and email sending
 * @property {Function} constructEmailTemplate - Creates HTML email template
 * @property {Function} escapeHtml - Sanitizes input to prevent XSS attacks
 * 
 * @throws {Error} When email configuration is invalid
 * @throws {Error} When email sending fails
 * 
 * @security This class implements HTML escaping for XSS prevention
 * @security Requires secure environment variables for email credentials
 * 
 * @author [Your Name]
 * @version 1.0.0
 */
class ContactController {
  // Method to handle contact form submission
  static async submitContactForm(req, res) {
    const { name, email, message } = req.body;

    try {
      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Construct email options
      const mailOptions = {
        from: email,
        to: process.env.RECIPIENT_EMAIL || "sparsh.officialwork@gmail.com",
        subject: `New Contact Form Submission from ${name}`,
        html: ContactController.constructEmailTemplate(name, email, message), // ✅ Use class name here
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Respond with success
      res.status(200).json({
        message: "Message sent successfully",
      });
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      res.status(500).json({
        message: "Failed to send message",
        error: error.message,
      });
    }
  }

  // Helper method to create email HTML template
  static constructEmailTemplate(name, email, message) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Message from Contact Form</h2>
        <p><strong>Name:</strong> ${ContactController.escapeHtml(
          name
        )}</p>
        <p><strong>Email:</strong> ${ContactController.escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${ContactController.escapeHtml(message)}</p>
        <p style="color: #888; font-size: 12px;">
          Received: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
    `;
  }

  // Helper method to escape HTML to prevent XSS
  static escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

module.exports = ContactController;
