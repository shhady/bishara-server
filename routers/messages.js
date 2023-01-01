import express from "express";
const router = express.Router();
import Message from "../models/Message.js";

router.post("/message", async (req, res) => {
  const { conversationId, sender, text } = req.body;
  const message = new Message({
    conversationId,
    sender,
    text,
  });
  try {
    const result = await message.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/message/:conversationId", async (req, res) => {
  const { conversationId } = req.params;
  try {
    const result = await Message.find({
      conversationId,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
