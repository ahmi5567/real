// import express from 'express'
// import authRoute from './routes/auth.route.js'
// import cookieParser from 'cookie-parser'
// import postRoute from './routes/post.route.js'
// import testRoute from './routes/test.route.js'
// import cors from 'cors'
// import userRoute from './routes/user.route.js'
// import chatRoute from './routes/chat.route.js'
// import messageRoute from './routes/message.route.js'

// const app = express();
// app.use(express.json())
// app.use(cookieParser())
// app.use(cors({origin:process.env.CLIENT_URL, credentials:true}))

// app.use('/api/auth' , authRoute)
// app.use('/api/users' , userRoute)
// app.use('/api/posts' , postRoute)
// app.use('/api/test' , testRoute)
// app.use('/api/chats' , chatRoute)
// app.use('/api/messages' , messageRoute)

// app.listen(5000, () => {
//   console.log('Server is running on port 5000');
// });

import { Server } from "socket.io";
import express from 'express';
import authRoute from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import postRoute from './routes/post.route.js';
import testRoute from './routes/test.route.js';
import cors from 'cors';
import userRoute from './routes/user.route.js';
import chatRoute from './routes/chat.route.js';
import messageRoute from './routes/message.route.js';
import helmet from 'helmet';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
const PORT = process.env.PORT || 5000


app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/posts', postRoute);
app.use('/api/test', testRoute);
app.use('/api/chats', chatRoute);
app.use('/api/messages', messageRoute);

if (process.env.NODE_ENV === 'production') {
  // Production specific code
  app.use(express.static('dist'));

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  app.set('trust proxy', 1);
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExist = onlineUser.find((user) => user.userId === userId);
  if (!userExist) {
    onlineUser.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
  return onlineUser.find(user => user.userId === userId);
}

io.on("connection", (socket) => {
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log(onlineUser);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});
