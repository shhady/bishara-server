import mongoose from "mongoose";
import validator from "validator";

const practiceSchema = mongoose.Schema(
  {
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
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
    uniqueLink: { type: String },
    videoReply: {
      type: [{ type: Object }],
      validate: {
        validator: function (arr) {
          return arr.length <= 4;
        },
        message: "Number of replies exceeded the limit of 4",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Practice", practiceSchema);
