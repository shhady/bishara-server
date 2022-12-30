import express from "express";
// import { signin, signup } from "../controllers/teacher.js";
const router = express.Router();
import Teacher from "../models/teacher.js";
import auth from "../middleware/authteacher.js";
import multer from "multer";
import sharp from "sharp";
// import cloudinary from "../cloudinary/cloudinary.js";

router.post("/teachers", async (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const teacher = new Teacher(req.body);
  // const avatar = req.body.avatar;

  if (password !== confirmPassword)
    return res.status(404).json({ message: "passwords don't match" });

  try {
    // if (avatar) {
    //   const uploadRes = await cloudinary.uploader.upload(avatar, {
    //     upload_preset: "bisharaHaroni",
    //   });
    //   return uploadRes;
    // }
    await teacher.save();
    const token = await teacher.generateAuthToken();
    res.status(201).send({ teacher, token });
  } catch (error) {
    res.status(400).send(error);
  }
});
// router.post("/teachers", async (req, res) => {
//   // const password = req.body.password;
//   // const confirmPassword = req.body.confirmPassword;
//   const {
//     firstName,
//     lastName,
//     instrument,
//     password,
//     confirmPassword,
//     email,
//     avatar,
//     about,
//   } = req.body;
//   // const teacher = new Teacher(req.body);

//   if (password !== confirmPassword)
//     return res.status(404).json({ message: "passwords don't match" });

//   try {
//     if (avatar) {
//       const uploadRes = await cloudinary.uploader.upload(avatar, {
//         upload_preset: "bisharaHaroni",
//       });

//       if (uploadRes) {
//         const teacher = new Teacher({
//           firstName,
//           lastName,
//           instrument,
//           password,
//           confirmPassword,
//           email,
//           about,
//           avatar: uploadRes,
//         });
//         const savedTeacher = await teacher.save();
//         const token = await savedTeacher.generateAuthToken();
//         res.status(201).send({ savedTeacher, token });
//       }
//     }
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

router.post("/teachers/login", async (req, res) => {
  try {
    const teacher = await Teacher.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await teacher.generateAuthToken();
    res.status(200).send({ teacher, token });
  } catch (error) {
    res.status(400).send("invalid email or password");
  }
});

router.get("/teachers", async (req, res) => {
  try {
    const teachers = await Teacher.find({});
    res.status(200).send(teachers);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/teachers/me", auth, async (req, res) => {
  res.send(req.teacher);
});

router.post("/teachers/logout", auth, async (req, res) => {
  try {
    req.teacher.tokens = req.teacher.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.teacher.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/teachers/logoutAll", auth, async (req, res) => {
  try {
    req.teacher.tokens = [];
    await req.teacher.save();
    res.send("LoggedOut of All devices");
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/teachers/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const teacher = await Teacher.findById(_id);
    if (!teacher) {
      return res.status(404).send();
    }
    res.send(teacher);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/teachers/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const allowedUpdate = [
    "avatar",
    "role",
    "cover",
    "password",
    "confirmPassword",
    "about",
  ];
  const isValidOperation = updates.every((update) => {
    return allowedUpdate.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }
  if (password !== confirmPassword)
    return res.status(404).json({ message: "passwords don't match" });

  try {
    const teacher = await Teacher.findById(req.params.id);

    updates.forEach((update) => (teacher[update] = req.body[update]));
    await teacher.save();
    // const practice = await practice.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!teacher) {
      res.status(404).send();
    }
    res.send(teacher);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch("/teachers/me", auth, async (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const updates = Object.keys(req.body);
  const allowedUpdate = [
    "role",
    "firstName",
    "lastName",
    "instrument",
    "image",
    "email",
    "password",
    "confirmPassword",
    "avatar",
    "about",
  ];
  const isValidOperation = updates.every((update) => {
    return allowedUpdate.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "invalid updates" });
  }

  if (password !== confirmPassword)
    return res.status(404).json({ message: "passwords don't match" });

  try {
    // const teacher = await Teacher.findById(req.params.id);

    updates.forEach((update) => (req.teacher[update] = req.body[update]));
    await req.teacher.save();
    // const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // if (!teacher) {
    //   res.status(404).send();
    // }
    res.send(req.teacher);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/teachers/:id", async (req, res) => {
  try {
    // const teacher = await Teacher.findByIdAndDelete(req.teacher._id);

    // if (!teacher) {
    //   return res.status(404).send();
    // }
    await req.teacher.remove();
    res.send(req.teacher);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    //prettier-ignore
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
      return cb(new Error("please upload an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/teachers/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.teacher.avatar = buffer;
    await req.teacher.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/teachers/me/avatar", auth, async (req, res) => {
  req.teacher.avatar = undefined;
  await req.teacher.save();
  res.send();
});

router.get("/teachers/:id/avatar", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher || !teacher.avatar) {
      throw new Error("no image");
    }
    res.set("Content-Type", "image/png");
    res.send(teacher.avatar);
  } catch (error) {
    res.status(404).send("something wrong");
  }
});
export default router;
