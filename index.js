import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routers/user.js";
import teacherRouter from "./routers/teacher.js";
import courseRouter from "./routers/course.js";
import practiceRouter from "./routers/practice.js";
import fileRouter from "./routers/file.js";

import conversationRouter from "./routers/conversations.js";
import messageRouter from "./routers/messages.js";
import openconversationRouter from "./routers/openConversations.js";
import commentRouter from "./routers/comment.js";
import replyRouter from "./routers/reply.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.Origin_Cors,
    methods: ["GET", "POST"],
  },
});
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/", (req, res) => {
  res.send("backend is running");
});
// io.on("connection", () => {
//   console.log("connected to websocket");
// });

let users = [];
const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};
// console.log(users);
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
  const selected = users.find((user) => user.userId == userId);
  // console.log(selected + "nowselected");
  return selected;
};

io.on("connection", (socket) => {
  // console.log("user connected");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    // console.log(users);
    io.emit("getUsers", users);
  });
  socket.on(
    "sendNotificationComment",
    ({
      senderName,
      senderFamily,
      senderId,
      receiverId,
      videoName,
      videoId,
      courseid,
    }) => {
      const user = getUser(receiverId);
      // console.log(receiverId);
      // console.log(senderId);
      // console.log(senderName);
      // console.log(videoName);
      // console.log(user);

      // console.log(io.sockets.manager.roomClient[user.socketId]);
      io.to(user?.socketId).emit("getNotificationComment", {
        senderName,
        senderFamily,
        // senderId,
        videoName,
        courseid,
        videoId,
      });
    }
  );

  socket.on("sendMessage", ({ senderId, receiverId, userName, text }) => {
    const user = getUser(receiverId);
    // console.log(io.sockets.manager.roomClient[user.socketId]);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      userName,
      text,
    });
  });

  socket.on("disconnect", () => {
    // console.log("disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: true,
    parameterLimit: 50000000,
  })
);
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// app.use("/posts", postRoutes);
app.use(userRouter);
app.use(teacherRouter);
app.use(courseRouter);
app.use(practiceRouter);
app.use(fileRouter);
app.use(conversationRouter);
app.use(messageRouter);
app.use(openconversationRouter);
app.use(commentRouter);
app.use(replyRouter);
const CONNECTION_URL = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.a3by20b.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    server.listen(PORT, () => console.log(`server running on port : ${PORT}`))
  )
  .catch((error) => console.log(error));

// mongoose.set("useFindAndModify", false);
