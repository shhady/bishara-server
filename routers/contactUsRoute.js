import express from "express";
import sgMail from "@sendgrid/mail";
import Contact from "../models/ContactUs.js";

const router = express.Router();

// Configure SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendEmail(message) {
    sgMail
      .send(message)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  }
router.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save the contact form submission to the database
    const contact = new Contact({
      name,
      email,
      message,
    });

    await contact.save();

    const msg = {
      to: 'shhadyse@gmail.com', // Replace with the recipient email address
      from: email,
      subject: 'New Message from user',
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    };

    // Send the email using SendGrid
    sendEmail(msg);

    return res.status(200).json({ message: `An email has been sent.to 'bisharaweb@gmail.com' from ${email}, with message:${message} ` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
});

export default router;
