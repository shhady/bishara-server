import mongoose from "mongoose";

const OpenConversationSchema = mongoose.Schema({
  openConversations: [{}],
});

export default mongoose.model("OpenConversation", OpenConversationSchema);
