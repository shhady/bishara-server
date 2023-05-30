import mongoose from "mongoose";
import validator from "validator";

const practiceSchema = mongoose.Schema(
  {
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
    playlistId:{ type: String },
    ownerId: { type: String },
    studentFirstName: { type: String },
    studentLastName: { type: String },
    teacherId: { type: String },
    teacherFirstName: { type: String },
    teacherLastName: { type: String },
    courseId: { type: String },
    courseName: { type: Object },
    courseLevel: { type: String },
    video: { type: String },
    myPractice: { type: String },
    reply: { type: String },
    replySeen: { type: String, default: true },
    uniqueLink: { type: String },
    videoReply: {
      type: [{ type: Object }],
      validate(videoReply) {
        if (videoReply.length > 4) {
          throw new Error("max four replies");
        }
      },
    },
    RecordReply: {
      type: [{ type: Object }],
      validate(RecordingReply) {
        if (RecordingReply.length > 2) {
          throw new Error("max two replies");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// practiceSchema.path("videoReply").validate(function (v) {
//   return v.length < 4;
// });
// practiceSchema.path("videoReply").validate(function (v) {
//   // Previous validation function goes here
//   // Return true if the value is valid, false otherwise
// }, function (v) {
//   return v.length < 4;
// });
export default mongoose.model("Practice", practiceSchema);
