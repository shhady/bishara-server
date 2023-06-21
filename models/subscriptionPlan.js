import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  period: {
    type: String,
    enum: ['6 months', 'year'],
    required: true,
  },
  dateStarted: {
    type: Date,
    required: true,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'trial', 'expired'],
    default: function () {
      const currentDate = new Date();
      const startDate = new Date(this.dateStarted);
      const endDate = new Date(startDate);

      if (this.period === '6 months') {
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (this.period === 'year') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      if (currentDate <= endDate) {
        const sevenDaysLater = new Date(startDate);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        if (currentDate <= sevenDaysLater) {
          return 'trial';
        } else {
          return 'active';
        }
      } else {
        return 'expired';
      }
    },
  },
});

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

