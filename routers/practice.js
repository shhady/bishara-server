import express from "express";
const router = express.Router();
import Practice from "../models/practice.js";
import auth from "../middleware/authuser.js";
import sgMail from "@sendgrid/mail";
import Teacher from "../models/teacher.js";
import User from "../models/user.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
function sendEmail(message) {
  sgMail
    .send(message)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
}
router.post("/practices", async (req, res) => {
  // The code to create a new practice
  const practice = new Practice({
    ...req.body,
    // owner: req.user._id,
  });
  try {
    await practice.save();

    // Find the teacher by teacherId from the Practice model
    const teacher = await Teacher.findById(practice.teacherId);

    // Send an email to the teacher's email
    if (teacher) {
      const teacherMsg = {
        to: teacher.email,
        from: "funanmusic@gmail.com",
        subject: "تم رفع تمرين",
        text: `تم رفع تمرين:
        اسم الطالب: ${practice.studentFirstName} ${practice.studentLastName}
        ${practice.courseId === 'evaluation' ? `منهاج: 
        الهدف: ${practice.goal},
        اين تعلم: ${practice.whereStudied},
        الخبره: ${practice.expTime}` : `الدرس: ${practice.courseName}, ${practice.video}`}
        رابط الفيديو: ${practice.myPractice}
        الرجاء الدخول الى صفحة تمارين الطلاب
        www.funan.org
        `,  
      };
      sendEmail(teacherMsg);
    }

    // Send an email to the hardcoded email
    const hardcodedMsg = {
      to: "funanmusic@gmail.com",
      from: "funanmusic@gmail.com",
      subject: `تم رفع تمرين الى  ${practice.teacherFirstName} ${practice.teacherLastName}  `,
      text: `تم رفع تمرين:
      اسم الطالب: ${practice.studentFirstName} ${practice.studentLastName}
        المدرس: ${practice.teacherFirstName} ${practice.teacherLastName}
        ${practice.courseId === 'evaluation' ? `منهاج: 
        الهدف: ${practice.goal},
        اين تعلم: ${practice.whereStudied},
        الخبره: ${practice.expTime}` : `الدرس: ${practice.courseName}, ${practice.video}`}
        رابط الفيديو: ${practice.myPractice}

        الرجاء الدخول الى صفحة تمارين الطلاب
        www.funan.org      `,
    };
    sendEmail(hardcodedMsg);

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
router.get("/practice/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const practice = await Practice.findById(_id);
    if (!practice) {
      return res.status(404).send();
    }
    res.send(practice);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/mypractices/:id", async (req, res) => {
  const teacherId = req.params.teacherId;
  try {
    const practices = await Practice.find({ teacherId: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).send(practices);
  } catch (error) {
    res.status(500).send(error);
  }
});
router.get("/studentpractices/:id", async (req, res) => {
  const ownerId = req.params.ownerId;
  try {
    const practices = await Practice.find({ ownerId: req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).send(practices);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/studentpractices/:id", async (req, res) => {
  try {
    // Find the Practice object with the specified ID and update it with the new values from the request body
    const practice = await Practice.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run the validators on the update
    });

    // If the Practice object was not found, return a 404 status code
    if (!practice) {
      return res.status(404).send();
    }

    // Send the updated Practice object as the response
    res.send(practice);
  } catch (error) {
    // If an error occurred, return a 400 status code
    res.status(400).send(error);
  }
});


router.put("/practices/:id", async (req, res) => {
  const theVideoReply = req.body.theVideoReply;
  const videoName = req.body.videoName;
  const courseId = req.body.courseId;
  const nameOfProblem = req.body.nameOfProblem;
  const practiceId = req.body.practiceId;
  const uniqueLink = req.body.uniqueLink;
  const teacherId = req.body.teacherId;
  const replyId = req.body.replyId;
  try {
    const practice = await Practice.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          videoReply: {
            theVideoReply,
            videoName,
            courseId,
            nameOfProblem,
            practiceId,
            uniqueLink,
            teacherId,
            replyId,
          },
        },
      }
    );
    if (practice.videoReply.length >= 4) {
      return res.status(400).send({ error: "max four replies" });
    } else {
      // Find the ownerId from the Practice model
      const ownerId = practice.ownerId;

      // Use the ownerId to find the user from the User schema
      const user = await User.findOne({ _id: ownerId });

      // Check if the user exists
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Send an email to the user's email
      const userEmailMsg = {
        to: user.email,
        from: "funanmusic@gmail.com",
        subject: `تم التعليق على عزفك من قبل ${practice.teacherFirstName} ${practice.teacherLastName}`,
        text: `مرحباً بك ${user.firstName},
        هناك تعليق على الفيديو الذي قمت برفعه من قبل المدرس: ${RecordReply.teacherFirstName} ${RecordReply.teacherLastName}
       www.funan.org
     `,
      };
      sgMail.send(userEmailMsg);

      await practice.save();

      res.status(200).send({ practice, user })
    }
  } catch (error) {
    res.status(404).send(error);
  }
});
router.put("/practiceRec/:id", async (req, res) => {
  const RecordingReply = req.body.RecordingReply;
  const videoName = req.body.videoName;
  const courseId = req.body.courseId;
  const nameOfProblem = req.body.nameOfProblem;
  const practiceId = req.body.practiceId;
  const uniqueLink = req.body.uniqueLink;
  const teacherId = req.body.teacherId;
  const replyId = req.body.replyId;
  
  try {
    const RecordReply = await Practice.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          RecordReply: {
            RecordingReply,
            videoName,
            courseId,
            nameOfProblem,
            practiceId,
            uniqueLink,
            teacherId,
            replyId,
          },
        },
      }
    );
    if (RecordReply.RecordReply.length >= 2) {
      return res.status(400).send({ error: "max two replies allowed" });
    } else {
      // Find the ownerId from the Practice model
      const ownerId = RecordReply.ownerId;

      // Use the ownerId to find the user from the User schema
      const user = await User.findOne({ _id: ownerId });

      // Check if the user exists
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      // Send an email to the user's email
      const userEmailMsg = {
        to: user.email,
        from: "funanmusic@gmail.com",
        subject: `تم التعليق على تمرينك من قبل ${RecordReply.teacherFirstName} ${RecordReply.teacherLastName}`,
        text: `مرحباً بك ${user.firstName},
        هناك تعليق على الفيديو الذي قمت برفعه من قبل المدرس: ${RecordReply.teacherFirstName} ${RecordReply.teacherLastName}
       www.funan.org
     `,
      };
      sgMail.send(userEmailMsg);

      await RecordReply.save();
      res.status(200).send({ RecordReply, user });
    }
  } catch (error) {
    res.status(404).send(error);
  }
});

router.put("/practice/deleteRecordReply/:id", async (req, res) => {
  const replyId = req.body.replyId;
  console.log(replyId);
  const practiceToUpdate = await Practice.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { RecordReply: { replyId: replyId } } }
  );
  await practiceToUpdate.save();

  res.status(200).send({ practiceToUpdate, replyId });
});

router.put('/practice/videoReply/:id', async (req, res) => {
  try {
    const replyId = req.body.replyId;
    console.log(replyId);

    const practiceToUpdate = await Practice.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { videoReply: { replyId: replyId } } }
    );
    await practiceToUpdate.save();

    res.status(200).send({ practiceToUpdate, replyId });
  } catch (error) {
    console.error('Failed to delete video reply:', error);
    res.status(500).json({ error: 'Failed to delete video reply' });
  }
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

    if (!practice) {
      return res.status(404).send();
    }

    // Find the ownerId from the Practice model
    const ownerId = practice.ownerId;

    // Use the ownerId to find the user from the User schema
    const user = await User.findOne({ _id: ownerId });

    // Check if the user exists
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Send an email to the user's email
    const userEmailMsg = {
      to: user.email,
      from: "funanmusic@gmail.com",
      subject: "Your practice has been updated",
      text: `مرحباً بك ${user.firstName},
       هناك تعليق على الفيديو الذي قمت برفعه من قبل المدرس: ${RecordReply.teacherFirstName} ${RecordReply.teacherLastName}
      www.funan.org
    `
      
      ,
    };
    sgMail.send(userEmailMsg);

    res.send({ practice, user });
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
