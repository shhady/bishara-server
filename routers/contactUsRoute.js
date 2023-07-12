const express = require('express');
const sgMail = require('@sendgrid/mail');
const Contact = require('../models/ContactUs.js');

const router = express.Router();

// Configure SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Save the contact form submission to the database
  const contact = new Contact({
    name,
    email,
    message,
  });

  contact.save()
    .then(() => {
      // Prepare the email message
      const msg = {
        to: 'bisharaweb@gmail.com',
        from: email,
        subject: 'New Message from user',
        text: `
          Name: ${name}
          Email: ${email}
          Message: ${message}
        `,
      };

      // Send the email using SendGrid
      sgMail.send(msg)
        .then(() => {
          console.log('Email sent');
          res.sendStatus(200);
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          res.status(500).json({ error: 'Failed to send email' });
        });
    })
    .catch(error => {
      console.error('Error saving contact:', error);
      res.status(500).json({ error: 'Failed to save contact' });
    });
});

export default router;