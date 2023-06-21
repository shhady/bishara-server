import express from "express";
const router = express.Router();
import subscriptionPlanController from '../controllers/subscriptionPlanController.js';

// Create a new subscription plan
router.post('/subscription-plans', subscriptionPlanController.createSubscriptionPlan);

// Get all subscription plans
router.get('/', subscriptionPlanController.getAllSubscriptionPlans);

// Get a single subscription plan by ID
router.get('/:id', subscriptionPlanController.getSubscriptionPlanById);

// Update a subscription plan by ID
router.put('/:id', subscriptionPlanController.updateSubscriptionPlanById);

// Delete a subscription plan by ID
router.delete('/:id', subscriptionPlanController.deleteSubscriptionPlanById);

export default router;
