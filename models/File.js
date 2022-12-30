import mongoose from "mongoose";

const FileSchema = mongoose.Schema({
  playListId: { type: String },
  videoId: { type: String },
  fileUrl: { type: String },
  teacherId: { type: String },
});

export default mongoose.model("File", FileSchema);
