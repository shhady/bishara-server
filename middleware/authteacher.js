// import jwt from "jsonwebtoken";

// const auth = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const isCustomAuth = token.length < 500;

//     let decodedData;
//     if (token && isCustomAuth) {
//       decodedData = jwt.verify(token, "test");

//       req.userId = decodedData?.id;
//     } else {
//       decodedData = jwt.decode(token);
//       req.userId = decodedData?.sub;
//     }
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// };

// export default auth;
import jwt from "jsonwebtoken";
import Teacher from "../models/teacher.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!teacher) {
      throw new Error();
    }
    req.token = token;
    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).send({ error: "please authenticate" });
  }
};
export default auth;
