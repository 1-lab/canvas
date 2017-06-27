var socketio = require('socket.io')
var express = require('express')
var http = require('http')
var ejs = require('ejs')
var fs = require('fs')

var app = express();
// app.use(app.router);
app.use(express.static('public'));

var server = http.createServer(app);
server.listen(52273, function () {
  console.log('server running at http://127.0.0.1:52273');
});

var io = socketio.listen(server);
io.set('log level', 2);

app.get('/', function (request, response) {
  fs.readFile('lobby.html', function (error, data) {
    response.send(data.toString());
  });
});

app.get('/canvas/:room', function (request, response) {
  fs.readFile('canvas.html', 'utf8', function (error, data) {
    response.send(ejs.render(data), {
      room: request.param('room')
    });
  });
});

app.get('/room', function (request, response) {
  response.send(io.sockets.manager.rooms);
});

io.sockets.on('connection', function (socket) {
  socket.on('join', function (data) {
    socket.join(data);
    socket.set('room', data);
  });
  
  socket.on('draw', function (data) {
    socket.get('room', function (error, room) {
      io.sockets.in(room).emit('line', data);
    });
  });
  
  socket.on('create_room', function (data) {
    io.sockets.emit('create_room', data.toString());
  });
});
