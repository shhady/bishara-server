import mongoose from "mongoose";

const CommentSchema = mongoose.Schema(
  {
    userid: { type: String },
    theCourse: { type: String },
    userAvatar: { type: String },
    courseId: { type: String },
    courseOwnerId: { type: String },
    videoName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    comment: { type: String },
    read: { type: Boolean },
    videoTitle: { type: String },
    playlistId: { type: String },
    replies: [{ type: Object }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comment", CommentSchema);
