import express from "express";
import auth from "../middleware/authuser.js";
import SubscriptionPlan from "../models/subscriptionPlan.js";
import Teacher from "../models/teacher.js";

const router = express.Router();
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
// Route for creating a new subscription plan
router.post('/subscription-plans',auth, async (req, res) => {
  try {
    const { period, userId, teacherId, teacherName, userName } = req.body;
    const dateStarted = new Date();

    // Calculate the endDate based on the period
    const endDate = new Date(dateStarted);
    if (period === '6 months') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if(period === '3 months'){
      endDate.setMonth(endDate.getMonth() + 3);
    }
     else if (period === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({ message: 'Invalid period specified' });
    }

    const subscriptionPlan = new SubscriptionPlan({
      period,
      dateStarted,
      endDate,
      userId,
      teacherId,teacherName, userName
    });
    // Fetch the teacher using the teacherId
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
       return res.status(404).json({ message: 'Teacher not found' });
      }

// Get the teacher's email from the teacher object
        const teacherEmail = teacher.email;

    await subscriptionPlan.save();
    // Send the email separately using an async function
    const teacherMsg = {
      to: teacherEmail,
      from: "funanmusic@gmail.com",
      subject: "New Subscription Plan Created",
      text: `A new subscription plan has been created for you.\n\nPeriod: ${period}\nStart Date: ${dateStarted}\nEnd Date: ${endDate}\n\nThank you.`,
    };
    sendEmail(teacherMsg);

    res.status(201).json(subscriptionPlan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subscription plan', error });
  }
});

// Route for updating an existing subscription plan
router.put('/subscription-plans/:id',auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { period, userId, teacherId,teacherName,status } = req.body;
    const dateStarted = new Date();

    // Calculate the endDate based on the period
    const endDate = new Date(dateStarted);
    if (period === '6 months') {
      endDate.setMonth(endDate.getMonth() + 6);
    }else if (period === '3 months') {
      endDate.setMonth(endDate.getMonth() + 3);
    } 
    else if (period === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({ message: 'Invalid period specified' });
    }
// Fetch the teacher using the teacherId
const teacher = await Teacher.findById(teacherId);
if (!teacher) {
  return res.status(404).json({ message: 'Teacher not found' });
}

// Get the teacher's email from the teacher object
const teacherEmail = teacher.email;

    const subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      {
        period,
        dateStarted,
        endDate,
        userId,
        teacherId,
        teacherName,
        status
      },
      { new: true }
    );

    if (!subscriptionPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    res.json(subscriptionPlan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subscription plan', error });
  }
});

// Get all subscription plans for a user
router.get("/subscription-plans", auth, async (req, res) => {
    try {
      const plans = await SubscriptionPlan.find({ userId: req.user._id });
      res.send(plans);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  router.get("/subscription-plans/teacher/:id", async (req, res) => {
    try {
      const plans = await SubscriptionPlan.find({ teacherId: req.params.id });
      res.send(plans);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  // Get a specific subscription plan by ID
router.get("/subscription-plans/:id", auth, async (req, res) => {
    try {
      const plan = await SubscriptionPlan.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
  
      if (!plan) {
        return res.status(404).send();
      }
  
      res.send(plan);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Update a subscription plan
  // router.put("/subscription-plans/:id", auth, async (req, res) => {
  //   try {
  //     const { period, teacherId } = req.body;
  //     const plan = await SubscriptionPlan.findOneAndUpdate(
  //       {
  //         _id: req.params.id,
  //         userId: req.user._id,
  //       },
  //       {
  //         period,
  //         teacherId,
  //       },
  //       { new: true }
  //     );
  
  //     if (!plan) {
  //       return res.status(404).send();
  //     }
  
  //     res.send(plan);
  //   } catch (error) {
  //     res.status(400).send(error);
  //   }
  // });
  
  // Delete a subscription plan
  router.delete("/subscription-plans/:id", auth, async (req, res) => {
    try {
      const plan = await SubscriptionPlan.findOneAndDelete({
        _id: req.params.id,
        userId: req.user._id,
      });
  
      if (!plan) {
        return res.status(404).send();
      }
  
      res.send(plan);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
export default router;