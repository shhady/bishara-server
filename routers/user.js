import express from "express";
// import { signin, signup } from "../controllers/user.js";
const router = express.Router();
import User from "../models/user.js";
import auth from "../middleware/authuser.js";
import multer from "multer";
import sharp from "sharp";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

router.put("/resetPassword", async (req, res) => {
  
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ error: "This email is not registered." });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newPassword;
    user.confirmPassword = newPassword;
    await user.save();
    res.send({user:user, password: newPassword, hashed:hashedPassword});
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: "Password reset",
      text: `Your new password is ${newPassword}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(400).send({ error: "Could not send email." });
      } else {
        return res
          .status(200)
          .send({ message: "An email has been sent with the new password." });
      }
    });
  } catch (error) {
    res.status(500).send({ error: "Server error." });
  }
});

// router.post("/signin", signin);
// router.post("/signup", signup);

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("LoggedOut of All devices");
  } catch (error) {
    res.status(500).send();
  }
});

router.post("/users", async (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const user = new User(req.body);
  if (password !== confirmPassword)
    return res.status(404).json({ message: "passwords don't match" });
    try {
      await user.save();
      const token = await user.generateAuthToken();
      res.status(201).send({ user, token });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).send({ message: "email already in use" });
      } else {
        res.status(400).send(error);
      }
    }
  // try {
  //   await user.save();
  //   const token = await user.generateAuthToken();
  //   res.status(201).send({ user, token });
  // } catch (error) {
  //   res.status(400).send(error);
  // }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (error) {
    res.status(400).send("invalid email or password");
  }
});

router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const allowedUpdate = [
    "firstName",
    "lastName",
    "avatar",
    "firstName",
    "lastName",
    "password",
    "confirmPassword",
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
    const user = await User.findById(req.params.id);

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    // const practice = await practice.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!user) {
      res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch("/users/me", auth, async (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const updates = Object.keys(req.body);
  const allowedUpdate = [
    "firstName",
    "lastName",
    "email",
    "password",
    "confirmPassword",
    "instrument",
    "avatar",
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
    // const user = await User.findById(req.params.id);

    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // if (!user) {
    //   res.status(404).send();
    // }
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    res.send(req.user);
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
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error("no image");
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

export default router;
