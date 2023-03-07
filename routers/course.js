import express from "express";
const router = express.Router();
import Course from "../models/course.js";
import auth from "../middleware/authteacher.js";
router.post("/courses", auth, (req, res) => {
  //   const course = new Course(req.body);
  const course = new Course({
    ...req.body,
    owner: req.teacher._id,
  });
  try {
    course.save();
    res.status(201).send(course);
  } catch (error) {
    res.status(400).send(error);
  }
});
router.post("/addCourses", (req, res) => {
    const myCourse = req.body
  const course = new Course({
    myCourse
  }
  );
  try {
    course.save();
    res.status(201).send(course);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/courses/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const course = await Course.findById(_id);

    // const course = await Course.findOne({ _id, owner: req.teacher._id });
    if (!course) {
      return res.status(404).send();
    }
    res.send(course);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/courses/:id", async (req, res) => {
  try {
    // Find the Practice object with the specified ID and update it with the new values from the request body
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Run the validators on the update
    });

    // If the Practice object was not found, return a 404 status code
    if (!course) {
      return res.status(404).send();
    }
    // Send the updated Practice object as the response
    res.send(course);
  } catch (error) {
    // If an error occurred, return a 400 status code
    res.status(400).send(error);
  }
});

// router.patch("/courses/:id", async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdate = [
//     "instrument",
//     "likes",
//     "videos",
//     "description",
//     "coursePhoto",
//     "title",
//   ];
//   const isValidOperation = updates.every((update) => {
//     return allowedUpdate.includes(update);
//   });

//   if (!isValidOperation) {
//     return res.status(400).send({ error: "invalid updates" });
//   }

//   try {
//     // const course = await Course.findOne({
//     //   _id: req.params.id,
//     //   owner: req.teacher._id,
//     // });

//     const course = await Course.findById(req.params.id);
//     if (!course) {
//       res.status(404).send();
//     }

//     updates.forEach((update) => (course[update] = req.body[update]));
//     await course.save();
//     // const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
//     //   new: true,
//     //   runValidators: true,
//     // });

//     res.send(course);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });
router.put("/courses/:id", async (req, res) => {
  const url = req.body.url;
  const episode = req.body.episode;
  const courseToupdate = await Course.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { videos: { url, episode } } }
  );
  await courseToupdate.save();
  // console.log(firstName);
  res.status(200).send(courseToupdate);
});

router.put("/course/:id", async (req, res) => {
  const videoId = req.body.videoId;
  // console.log(videoId);
  const courseToupdate = await Course.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { videos: { _id: videoId } } }
  );
  await courseToupdate.save();
  // console.log(firstName);

  res.status(200).send(courseToupdate);
});

router.delete("/courses/:id", async (req, res) => {
  try {
    // const course = await Course.findByIdAndDelete(req.params.id);
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      // owner: req.teacher._id,
    });
    if (!course) {
      return res.status(404).send();
    }
    res.send(course);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;

// let videos = [...req.body.videos];
// let showVideos = [];
// for (let i = 0; i < videos.length; i++) {
//   const result = await cloudinary.uploader.upload(videos[i], {
//     upload_preset: "bisharaHaroni",
//   });

//   showVideos.push({
//     public_id: result.public_id,
//     url: result.secure_url,
//   });
// }
// req.body.videos = showVideos;
// const course = await Course.create({ ...req.body, owner: req.teacher._id });
