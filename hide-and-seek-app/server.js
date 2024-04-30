const express = require('express');
const mongoose = require('mongoose');
const http = require('http').Server(express);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/hideAndSeek');

// 设置静态文件目录
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// 启动服务器
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// ....创建游戏房间和处理用户加入

let currentRoom;

app.post('/room', async (req, res) => {
  const room = new Room({
    name: req.body.name,
    location: req.body.location
  });
  const savedRoom = await room.save();
  currentRoom = savedRoom;
  res.status(200).json(savedRoom);
});

app.post('/join', async (req, res) => {
  const user = new User({
    nickname: req.body.nickname,
    role: req.body.role,
    position: req.body.position
  });
  const savedUser = await user.save();
  if (currentRoom) {
    currentRoom.players.push(savedUser._id);
    await currentRoom.save();
  }
  res.status(200).json(savedUser);
});


// ...处理游戏逻辑

io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.on('joinRoom', (roomId, userData) => {
      // 将用户添加到房间
    });
  
    socket.on('updatePosition', (position) => {
      // 更新用户位置
      // 检查距离并通知寻找者
    });
  
    socket.on('hiderReady', (hiderId) => {
      // 隐藏者准备就绪
    });
  
    socket.on('seekerFoundHider', (hiderId) => {
      // 寻找者找到了隐藏者
      io.emit('gameOver', hiderId);
    });
  
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });