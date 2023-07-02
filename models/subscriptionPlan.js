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
  endDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
  },
  teacherId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired'],
    default: 'active',
  },
},
{ timestamps: true }
);

subscriptionPlanSchema.pre('save', function (next) {
  const startDate = new Date(this.dateStarted);
  if (this.period === '6 months') {
    this.endDate = new Date(startDate.setMonth(startDate.getMonth() + 6));
  } else if (this.period === 'year') {
    this.endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
  }
  next();
});

subscriptionPlanSchema.statics.updateSubscriptionStatus = async function () {
  const currentDate = new Date();
  const subscriptionPlans = await this.find();

  for (const plan of subscriptionPlans) {
    if (currentDate > plan.endDate) {
      plan.status = 'expired';
    } else {
      plan.status = 'active';
    }
  }

  await Promise.all(subscriptionPlans.map(plan => plan.save()));
};

// Run the status update task every 24 hours (adjust the interval as needed)
setInterval(async () => {
  await subscriptionPlanSchema.statics.updateSubscriptionStatus();
}, 24 * 60 * 60 * 1000);

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
