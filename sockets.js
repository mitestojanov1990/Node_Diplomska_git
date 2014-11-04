var mainRoom = 'mainRoom';
function SocketHelper() {
	this.io = require('socket.io').listen(global.server);
	this.io.sockets.socketPool = [];

    //incoming connections
	this.io.sockets.on('connection', function (socket) {
	    socket.on('adduser', function (userID) {
			global.SocketHelper.io.sockets.socketPool[userID] = socket;
			global.SocketHelper.io.sockets.sockets[userID] = socket;
			socket.userID = userID;
			socket.room = mainRoom;
			socket.join(mainRoom);
		});

	    socket.on('NewPost', function (username, message) {
	        global.SocketHelper.io.sockets.in(socket.room).emit('UpdateMainRoom', username, message);
	    });
	});

		
}
global.SocketHelper = new SocketHelper();