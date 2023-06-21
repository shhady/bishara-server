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

// Get all subscription plans for a user
router.get("/subscription-plans", auth, async (req, res) => {
    try {
      const plans = await SubscriptionPlan.find({ userId: req.user._id });
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
  router.put("/subscription-plans/:id", auth, async (req, res) => {
    try {
      const { period, teacherId } = req.body;
      const plan = await SubscriptionPlan.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.user._id,
        },
        {
          period,
          teacherId,
        },
        { new: true }
      );
  
      if (!plan) {
        return res.status(404).send();
      }
  
      res.send(plan);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
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