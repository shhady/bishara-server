import mongoose from "mongoose";
// const userSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   id: { type: String, required: true },
// });

// export default mongoose.model("User", userSchema);
const MessageSchema = mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", MessageSchema);
