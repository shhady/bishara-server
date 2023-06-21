import express from "express";
import auth from "../middleware/authuser.js";
import SubscriptionPlan from "../models/subscriptionPlan.js";

const router = express.Router();

router.post("/subscription-plans", auth, async (req, res) => {
  try {
    const { period, teacherId } = req.body;
    const plan = new SubscriptionPlan({
      period,
      teacherId,
      dateStarted: new Date().toISOString(),
      userId: req.user._id,
    });
    await plan.save();
    res.status(201).send(plan);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;