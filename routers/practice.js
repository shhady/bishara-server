import express from "express";
const router = express.Router();
import Practice from "../models/practice.js";
import auth from "../middleware/authuser.js";
router.post("/practices", (req, res) => {
  //   const course = new Course(req.body);
  const practice = new Practice({
    ...req.body,
    // owner: req.user._id,
  });
  try {
    practice.save();
    res.status(201).send(practice);
  } catch (error) {
    res.status(400).send(error);
  }
});

// **everybody can see the practices of the students*****
router.get("/practices", async (req, res) => {
  try {
    const practices = await Practice.find({}).sort({
      createdAt: -1,
    });
    res.status(200).send(practices);
  } catch (error) {
    res.status(500).send(error);
  }
});
//**only the student can see his practices*****
// router.get("/practices", auth, async (req, res) => {
//   const match = {};
//   try {
//     const practices = await Practice.find({ owner: req.user._id }).sort({
//       createdAt: -1,
//     });
// await req.user
//   .populate({
//     path: "practices",
//     match,
//     options: {
//       limit: parseInt(req.query.limit),
//     },
//   })
//   .execPopulate();
//     res.status(200).send(practices);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

router.get("/practices/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const practice = await Practice.findOne({ _id, owner: req.user._id });
    if (!practice) {
      return res.status(404).send();
    }
    res.send(practice);
  } catch (error) {
    res.status(500).send();
  }
});

router.put("/practice/:id", async (req, res) => {
  const theVideoReply = req.body.theVideoReply;
  const videoName = req.body.videoName;
  const courseId = req.body.courseId;
  const nameOfProblem = req.body.nameOfProblem;
  const practiceId = req.body.practiceId;
  console.log(reply);
  const videoReply = await Practice.findOneAndUpdate(
    { _id: req.params.id },
    {
      $push: {
        videoReply: {
          theVideoReply,
          videoName,
          courseId,
          nameOfProblem,
          practiceId,
        },
      },
    }
  );
  await videoReply.save();
  // console.log(firstName);
  res.status(200).send(videoReply);
});

router.patch("/practices/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ["videos", "reply", "videoReply"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdate.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }

  try {
    const practice = await Practice.findById(req.params.id);

    updates.forEach((update) => (practice[update] = req.body[update]));
    await practice.save();
    // const practice = await practice.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!practice) {
      res.status(404).send();
    }
    res.send(practice);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/practices/:id", async (req, res) => {
  try {
    // const practice = await Practice.findByIdAndDelete(req.params.id);
    const practice = await Practice.findOneAndDelete({
      _id: req.params.id,
      // owner: req.user._id,
    });

    if (!practice) {
      return res.status(404).send();
    }
    res.send(practice);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
