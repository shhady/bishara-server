import express from "express";
const router = express.Router();
import Reply from "../models/reply.js";
router.post("/replies", (req, res) => {
  //   const course = new Course(req.body);
  const reply = new Reply({
    ...req.body,
  });
  try {
    reply.save();
    res.status(201).send(reply);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/replies", async (req, res) => {
  try {
    const replies = await Reply.find({}).sort({ createdAt: -1 });
    res.status(200).send(replies);
  } catch (error) {
    res.status(500).send(error);
  }
});
export default router;
