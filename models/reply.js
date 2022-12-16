import mongoose from "mongoose";

const ReplySchema = mongoose.Schema({
  theVideoReply: { type: String },
  videoName: { type: String },
  courseId: { type: String },
  nameOfProblem: { type: String, required: true },
  practiceId: { type: String },
  uniqueLink: { type: String },
  teacherId: { type: String },
});

ReplySchema.statics.findManyByTeacherId = async function (teacherId) {
  return this.find({ teacherId });
};
export default mongoose.model("Reply", ReplySchema);
