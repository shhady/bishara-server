import express from "express";
// import { signin, signup } from "../controllers/user.js";
const router = express.Router();
import User from "../models/user.js";
import auth from "../middleware/authuser.js";
import multer from "multer";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail"
import moment from 'moment';

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

router.put("/resetPassword", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "This email is not registered." });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newPassword;
    user.confirmPassword = newPassword;
    await user.save();

    const msg = {
      to: email,
      from: "bisharaweb@gmail.com",
      subject: "تغيير كلمة المرور",
      text: `يمكنك تغييرها بعد الدخول الى الملف الشخصي وبعد ذلك تعديل الملف ${newPassword} كلمة المرور الجديدة `,
    };

    sendEmail(msg);

    return res.status(200).json({ message: "An email has been sent with the new password." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error." });
  }
});
// router.put("/resetPassword", async (req, res) => {
//   const email = req.body.email;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).send({ error: "This email is not registered." });
//     }
 
//     const newPassword = Math.random().toString(36).slice(-8);
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);
 
//     user.password = newPassword;
//     user.confirmPassword = newPassword;
//     await user.save();

//     const msg = {
//       to: email,
//       from: "bisharaweb@gmail.com", // change this to your sender email
//       subject: "Password reset",
//       text: `Your new password is ${newPassword}`,
//     };
 
//     await sgMail.send(msg);
//     return res.status(200).send({p:newPassword, message: "An email has been sent with the new password." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "Server error." });
//   }
// });

 
// router.put("/paid", async (req, res) => {
//   const { email, userId, paidDate, paidPeriod } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).send({ error: "This email is not registered." });
//     }
//     user.paid = userId;
//     user.paidDate=paidDate;
//     user.paidPeriod=paidPeriod;
//     await user.save();
//     res.send({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "Server error." });
//   }
// });


router.put("/evaluation", async (req, res) => {
  const { email, whereStudied, goal, experience, status } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "This email is not registered." });
    }
    user.whereStudied = whereStudied;
    user.goal=goal;
    user.experience=experience;
    user.status = status;
    await user.save();
    res.send({ user });
  } catch (error) {
    console.error(error);
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
router.get("/myUsers/:id", async (req, res) => {
  // const id = req.params.id;
  try {
    const users = await User.find({trialTeacher:req.params.id}).sort({
      createdAt: -1,
    });;
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

  if (password.length < 5) {
    return res
      .status(400)
      .json({ message: "كلمة المرور يجب أن تحتوي على 5 أحرف على الأقل" });
  }

  if (password !== confirmPassword)
    return res
      .status(404)
      .json({ message: "يجب تطابق كلمة المرور وتأكيد كلمة المرور" });

  try {
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "هذا الايميل قيد الاستخدام" });
    }

    // If the email is not found, create a new user
    const user = new User(req.body);
    await user.save();

    // Generate auth token and send the response
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    // Handle other errors, such as validation errors
    return res.status(400).send({ message: "جميع الحقول الزامية" });
  }
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

router.patch("/users/:id", auth, async (req, res) => {
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
    "subscriptionPlan",
    "status"
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
    const user = await User.findById(req.params.id).populate('subscriptionPlan');

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    
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
    "subscriptionPlan",
    "status"
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
