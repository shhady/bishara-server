import express from "express";
const router = express.Router();
import OpenConversation from "../models/OpenConversations.js";

router.post("/openconversations", async (req, res) => {
  const openConversation = new OpenConversation({
    openConversations: [
      { senderId: req.body.senderId, receiverId: req.body.receiverId },
    ],
  });
  console.log(openConversation);
  try {
    const savedConversations = await openConversation.save();
    res.status(200).json(savedConversations);
  } catch (error) {
    res.status(500).json(error);
  }
});
router.get("/openconversations", async (req, res) => {
  try {
    const openConversations = await OpenConversation.find({});
    res.status(200).send(openConversations);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
