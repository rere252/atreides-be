require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

module.exports = { app, wss };

wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('message', message => {
      const data = JSON.parse(message);
      handleMessages(data, ws);
    });
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  function handleMessages(data, ws) {
    switch(data.type) {
      case 'locationUpdate':
        broadcastLocation(data);
        break;
      case 'gameEvent':
        handleGameEvent(data, ws);
        break;
    }
  }
  
  function broadcastLocation(data) {
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  