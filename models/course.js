import mongoose from "mongoose";
import validator from "validator";
// const userSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   id: { type: String, required: true },
// });

// export default mongoose.model("User", userSchema);
const courseSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Teacher",
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: { type: String },
    description: { type: String },
    playlistId: { type: String },
    coursePhoto: { type: String },
    instrument: { type: String, required: true },
    level: { type: String, required: true },
    videos: [
      {
        episode: { type: String },
        url: { type: String },
      },
    ],
    // comments: [
    //   {
    //     comment: { type: Object },
    //     // reply: { type: Object },
    //   },
    // ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseSchema);
