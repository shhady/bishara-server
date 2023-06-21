import express from "express";
const router = express.Router();
import auth from "../middleware/authuser.js";
import SubscriptionPlan from "../models/subscriptionPlan.js"
// import subscriptionPlanController from '../controllers/subscriptionPlanController.js';

// Create a new subscription plan

  router.post("/subscription-plans", auth, (req, res) => {
    //   const course = new Course(req.body);
    const plan = new SubscriptionPlan({
      ...req.body,
    });
    try {
        plan.save();
      res.status(201).send(plan);
    } catch (error) {
      res.status(400).send(error);
    }
  });
// // Get all subscription plans
// router.get('/', subscriptionPlanController.getAllSubscriptionPlans);

// // Get a single subscription plan by ID
// router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// // Update a subscription plan by ID
// router.put('/:id', subscriptionPlanController.updateSubscriptionPlanById);

// // Delete a subscription plan by ID
// router.delete('/:id', subscriptionPlanController.deleteSubscriptionPlanById);

export default router;
