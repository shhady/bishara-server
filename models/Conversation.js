import mongoose from "mongoose";
// const userSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   id: { type: String, required: true },
// });

// export default mongoose.model("User", userSchema);
const ConversationSchema = mongoose.Schema(
  {
    members: { type: Array },
  },
  {
    senderReceiver: { type: String },
  },
  {
    receiverSender: { type: String },
  },
  {
    lastUpdated: { type: String },
  },
  {
    seen: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Conversation", ConversationSchema);
