const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const users = {};
let waitingUser = null;

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('set username', (username) => {
    const userId = uuidv4();
    users[socket.id] = { username, userId, partner: null };
    
    socket.emit('username set', { username, userId });
    
    if (waitingUser) {
      // Match with waiting user
      users[socket.id].partner = waitingUser;
      users[waitingUser].partner = socket.id;
      
      io.to(socket.id).emit('chat start', {
        username: users[waitingUser].username,
        userId: users[waitingUser].userId
      });
      io.to(waitingUser).emit('chat start', { username, userId });
      
      waitingUser = null;
    } else {
      // Wait for a partner
      waitingUser = socket.id;
      socket.emit('waiting');
    }
  });

  socket.on('chat message', (msg) => {
    const user = users[socket.id];
    if (user && user.partner) {
      io.to(user.partner).emit('chat message', {
        username: user.username,
        userId: user.userId,
        message: msg
      });
      socket.emit('chat message', {
        username: user.username,
        userId: user.userId,
        message: msg
      });
    }
  });

  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const partner = users[socket.id].partner;
      if (partner) {
        io.to(partner).emit('partner left');
        users[partner].partner = null;
      }
      delete users[socket.id];
    }
    if (waitingUser === socket.id) {
      waitingUser = null;
    }
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});