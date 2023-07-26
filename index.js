import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routers/user.js";
import teacherRouter from "./routers/teacher.js";
import courseRouter from "./routers/course.js";
import practiceRouter from "./routers/practice.js";
import fileRouter from "./routers/file.js";
import subscriptionPlanRoutes from './routers/subscriptionPlanRoutes.js';
import conversationRouter from "./routers/conversations.js";
import messageRouter from "./routers/messages.js";
import openconversationRouter from "./routers/openConversations.js";
import commentRouter from "./routers/comment.js";
import replyRouter from "./routers/reply.js";
import contactRouter from "./routers/contactUsRoute.js";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.Origin_Cors,
    methods: ["GET", "POST","PUT", "PATCH","DELETE"],
    allowedHeaders: ["my-custom-header"],
    credentials:true
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

let users = [];

const addUser = (userId, socketId) => {
  const user = users.find((user) => user.userId === userId);
  if (user) {
    user.socketIds.push(socketId);
  } else {
    users.push({ userId, socketIds: [socketId] });
  }
};

const removeUser = (socketId) => {
  users.forEach((user) => {
    user.socketIds = user.socketIds.filter((id) => id !== socketId);
  });
  users = users.filter((user) => user.socketIds.length > 0);
};

const getUsersByUserId = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendNotificationComment", ({
    senderName,
    senderFamily,
    senderId,
    receiverId,
    videoName,
    videoId,
    courseid,
  }) => {
    const user = getUsersByUserId(receiverId);
    if (user) {
      user.socketIds.forEach((socketId) => {
        io.to(socketId).emit("getNotificationComment", {
          senderName,
          senderFamily,
          videoName,
          courseid,
          videoId,
        });
      });
    }
  });

  socket.on("sendMessage", ({ senderId, receiverId, userName, text }) => {
    const user = getUsersByUserId(receiverId);
    if (user) {
      user.socketIds.forEach((socketId) => {
        io.to(socketId).emit("getMessage", {
          senderId,
          userName,
          text,
        });
      });
    }
  });

  socket.on("disconnect", () => {
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
app.use(subscriptionPlanRoutes);
app.use(contactRouter)



app.post('/cardcom/webhook', (req, res) => {
  const webhookData = req.body; // Assuming the incoming data is in JSON format

  // Verify webhook signature (if applicable) - Check cardcom documentation for details

  // Log the webhook data to see it in the Heroku logs
  console.log('Received webhook data:', webhookData);

  // Process the webhook data for cardcom policy
  if (webhookData) {
    // Handle cardcom policy based on the webhook data
    // For example, update your database, trigger events, etc.

    // Log any actions or data changes you are making
    console.log('Handling cardcom policy:', webhookData);

    // Respond with a success status to the webhook provider
    res.status(200).send('Webhook data processed successfully.', webhookData);
  } else {
    // Log the error
    console.log('Invalid webhook data:', webhookData);

    // Respond with an error status if the webhook data is invalid
    res.status(400).end();
  }
});

const CONNECTION_URL = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.a3by20b.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    server.listen(PORT, () => console.log(`server running on port : ${PORT}`))
  )
  .catch((error) => console.log(error));

// mongoose.set("useFindAndModify", false);
