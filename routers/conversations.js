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
    seen: req.body.seen,
    senderReceiver: req.body.senderReceiver,
    senderId: req.body.senderId,
    receiver: req.body.receiver,
    lastUpdated: req.body.lastUpdated,
    lastSender: req.body.lastSender,
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

router.patch("/conversations/:id", async (req, res) => {
  try {
    // Find the Practice object with the specified ID and update it with the new values from the request body
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run the validators on the update
      }
    );

    // If the Practice object was not found, return a 404 status code
    if (!conversation) {
      return res.status(404).send();
    }
    // Send the updated Practice object as the response
    res.send(conversation);
  } catch (error) {
    // If an error occurred, return a 400 status code
    res.status(400).send(error);
  }
});

export default router;
