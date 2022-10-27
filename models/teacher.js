import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// const teacherSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   id: { type: String, required: true },
// });

// export default mongoose.model("User", userSchema);
const teacherSchema = mongoose.Schema(
  {
    role: { type: String, default: "teacher" },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    instrument: { type: String, required: true },
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
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: { type: String },
    about: { type: String },
  },

  {
    timestamps: true,
  }
);

teacherSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "owner",
});

teacherSchema.methods.toJSON = function () {
  const teacher = this;
  const teacherObject = teacher.toObject();

  delete teacherObject.password;
  delete teacherObject.confirmPassword;
  delete teacherObject.tokens;
  // delete teacherObject.avatar;

  return teacherObject;
};

teacherSchema.methods.generateAuthToken = async function () {
  const teacher = this;

  const token = jwt.sign(
    { _id: teacher._id.toString() },
    process.env.JWT_SECRET
    // {
    //   expiresIn: "1 day",
    // }
  );
  teacher.tokens = teacher.tokens.concat({ token });
  await teacher.save();
  return token;
};

teacherSchema.statics.findByCredentials = async (email, password) => {
  const teacher = await Teacher.findOne({ email });
  if (!teacher) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, teacher.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return teacher;
};

teacherSchema.pre("save", async function (next) {
  const teacher = this;
  if (teacher.isModified("password")) {
    teacher.password = await bcrypt.hash(teacher.password, 8);
  }
  if (teacher.isModified("confirmPassword")) {
    teacher.confirmPassword = await bcrypt.hash(teacher.confirmPassword, 8);
  }
  next();
});
const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
