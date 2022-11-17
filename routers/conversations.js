import express from "express";
const router = express.Router();
import Conversation from "../models/Conversation.js";

router.get("/conversations", async (req, res) => {
  try {
    const Conversations = await Conversation.find({});
    res.status(200).send(Conversations);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.post("/conversations", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });
  console.log(newConversation);
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/conversations/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).sort({ createdAt: -1 });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get(
  "/conversations/find/:firstUserId/:secondUserId",
  async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation);
    } catch (error) {
      res.status(404).json(error);
    }
  }
);

export default router;
