module.exports = function(server, sessionMiddleware){
	var io = require("socket.io")(server);
	var redis = require("redis");
	var client = redis.createClient();

	client.subscribe("images");

	io.use(function(socket,next){
		sessionMiddleware(socket.request,socket.request.res,next);
	});
//Cuando recibimos un mensaje de express
	client.on("message",function(channel,message){
		
		if(channel=="images"){
			io.emit("new image", message);
		}
	//	console.log("Recibimos un mensaje del canal: "+channel);
	//	console.log(message);
	});

	io.sockets.on("connection",function(socket){
		console.log(socket.request.session.user_id);
	});
}