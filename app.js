const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const chatController = require('./controllers/chat');
const multer = require('multer')
const path = require('path')
const Messages = require('./models/message'); 
const Room = require('./models/room');
const MongoURI = 'mongodb+srv://whoami:dG1awObaBeCC87ur@cluster0.dqdhphe.mongodb.net/chat?retryWrites=true&w=majority';
const mongoose = require('mongoose');
let SOCKETS_DATA = [];
const fileStorage = multer.diskStorage({
	destination:(req,file,cb)=>{
		cb(null,'images')
	},
	filename:(req,file,cb)=>{
		cb(null,new Date().toISOString() + '-' + file.originalname)
	}
})

// CORS Header
app.use((req,res,next)=>{
	res.setHeader('Access-Control-Allow-Origin','*');
	res.setHeader('Access-Control-Allow-Methods','OPTIONS, GET, POST, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
	next();
});

//app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use('/images',express.static(path.join(__dirname,'images')))
app.use(multer({ dest: 'images' }).single('image'));
app.use(bodyParser.json());
app.use('/chat',chatRoutes);
app.use('/auth',authRoutes);
app.use((error,req,res,next)=>{
		const status = error.statusCode || 500;
		const message = error.message;
		const data = error.data;
		res.status(status).json({message:message,data:data})
});

// MongoDB connection 
mongoose.connect(MongoURI).
then(result => {
    console.log('Connected!');
	const server = app.listen(3000);
	const io = require('./socket').init(server);
	// Sockets Connection
    io.on('connection',socket=>{
		// Validate if user logged in
		if(socket.handshake.auth.userId){
			SOCKETS_DATA.push({socketId:socket.id,userId:socket.handshake.auth.userId});
			
		}
		const indx = SOCKETS_DATA.findIndex(s=>s.userId === socket.handshake.auth.userId);
		// User Joins Room
		socket.on('joinRoom',({roomId,roomName,userId})=>{
			socket.join(roomId);
			Room.findById(roomId).then(result=>{
				result.members.push(userId);
				return result.save();
			}).then(res=>{
				io.to(roomId).emit('userJoined','User has joined the room');
			}).catch(err=>{
				console.log(err);
			});
		});

		// User Sends A Message Into A Room
		socket.on('room message',({message,roomId,from,sentAt})=>{
			chatController.sendRoomMessage(roomId,from,message,sentAt);
			io.to(roomId).emit('room message',{message,roomId,from,sentAt});
		});

		// User Sends A Privage Message To Another User
		socket.on("private message", ({ message, to,from,sentAt }) => {
		//const newMessage = new Messages({sender:from,reciever:to,text:message,channelId:'fsociety',sentAt:sentAt});
		const newMessage = chatController.sendMessage(from,to,message,sentAt);
		newMessage.then(result=>{
		
			if(indx!=-1){
				io.to(SOCKETS_DATA[indx].socketId).emit("private message", {
					message:result.text,
					from: from,
					sentAt
				  });		
			}
	}).catch(err=>{
		console.log(err);
	});			
		  });

		  // User Disconnect From The Channel
		  socket.on("disconnect",()=>{
			SOCKETS_DATA = SOCKETS_DATA.filter(s=>s.socketId!==socket.id);
		  });
		});

}).catch(err => {
    console.log(err);
});