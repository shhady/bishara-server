import mongoose from "mongoose";

const ReplySchema = mongoose.Schema({
  theVideoReply: { type: String },
  videoName: { type: String },
  courseId: { type: String },
  nameOfProblem: { type: String },
  practiceId: { type: String },
  uniqueLink: { type: String },
});

export default mongoose.model("Reply", ReplySchema);
