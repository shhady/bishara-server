import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Practice from "./practice.js";
// const userSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   id: { type: String, required: true },
// });

// export default mongoose.model("User", userSchema);
const userSchema = mongoose.Schema(
  {
    trialTeacher:{type: String},
    trialDateStart:{type: Date},
    trialPeriod:{type:Number},
    whereStudied:{type: String},
    goal:{type: String},
    experience:{type: String},
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: { type: String, required: true, minlength: 5, trim: true },
    confirmPassword: { type: String, required: true, minlength: 5, trim: true },
    avatar: { type: String },
    // instrument: { type: String, required: true },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    // avatar: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("practices", {
  ref: "Practice",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.confirmPassword;
  delete userObject.tokens;
  // delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET
    // , {
    //   expiresIn: "1 day",
    // }
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  if (user.isModified("confirmPassword")) {
    user.confirmPassword = await bcrypt.hash(user.confirmPassword, 8);
  }
  next();
});

// delete user tasks if he removes his account

userSchema.pre("remove", async function (next) {
  const user = this;
  await Practice.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);
export default User;

// const User = mongoose.model("User", {
//     firstName: { type: String, required: true, trim: true },
//     lastName: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//       validate(value) {
//         if (!validator.isEmail(value)) {
//           throw new Error("Invalid email");
//         }
//       },
//     },
//     password: { type: String, required: true, minlength: 7, trim: true },
//     id: { type: String, required: true },
// });

// module.exports = User;
