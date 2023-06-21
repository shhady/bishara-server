// import SubscriptionPlan from '../models/subscriptionPlan.js';

// // Create a new subscription plan
// export const createSubscriptionPlan = async (req, res) => {
//   try {
//     const subscriptionPlan = await SubscriptionPlan.create(req.body);
//     res.status(201).json(subscriptionPlan);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create subscription plan' });
//   }
// };

// // Get all subscription plans
// export const getAllSubscriptionPlans = async (req, res) => {
//   try {
//     const subscriptionPlans = await SubscriptionPlan.find();
//     res.json(subscriptionPlans);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve subscription plans' });
//   }
// };

// // Get a single subscription plan by ID
// export const getSubscriptionPlanById = async (req, res) => {
//   try {
//     const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);
//     if (!subscriptionPlan) {
//       return res.status(404).json({ error: 'Subscription plan not found' });
//     }
//     res.json(subscriptionPlan);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve subscription plan' });
//   }
// };

// // Update a subscription plan by ID
// export const updateSubscriptionPlanById = async (req, res) => {
//   try {
//     const subscriptionPlan = await SubscriptionPlan.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!subscriptionPlan) {
//       return res.status(404).json({ error: 'Subscription plan not found' });
//     }
//     res.json(subscriptionPlan);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to update subscription plan' });
//   }
// };

// // Delete a subscription plan by ID
// export const deleteSubscriptionPlanById = async (req, res) => {
//   try {
//     const subscriptionPlan = await SubscriptionPlan.findByIdAndRemove(
//       req.params.id
//     );
//     if (!subscriptionPlan) {
//       return res.status(404).json({ error: 'Subscription plan not found' });
//     }
//     res.json({ message: 'Subscription plan deleted' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to delete subscription plan' });
//   }
// };
