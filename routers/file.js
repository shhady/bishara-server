import express from "express";
const router = express.Router();
import File from "../models/File.js";
router.post("/files", (req, res) => {
  //   const course = new Course(req.body);
  const file = new File({
    ...req.body,
  });
  try {
    file.save();
    res.status(201).send(file);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/files/:id", async (req, res) => {
  const videoId = req.params.videoId;
  try {
    const files = await File.find({ videoId: req.params.id });
    res.status(200).send(files);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/files/:id", async (req, res) => {
  try {
    // const practice = await Practice.findByIdAndDelete(req.params.id);
    const file = await File.findOneAndDelete({
      _id: req.params.id,
      // owner: req.user._id,
    });

    if (!file) {
      return res.status(404).send();
    }
    res.send(file);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
