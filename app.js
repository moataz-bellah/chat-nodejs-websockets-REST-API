const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const multer = require('multer')
const path = require('path')
const Messages = require('./models/message'); 
const MongoURI = 'mongodb+srv://whoami:dG1awObaBeCC87ur@cluster0.dqdhphe.mongodb.net/chat?retryWrites=true&w=majority';
const mongoose = require('mongoose');
let SOCKETS_DATA = [];
const fileStorage = multer.diskStorage({
	destination:(req,file,cb)=>{
		console.log(file)
		cb(null,'images')
	},
	filename:(req,file,cb)=>{
		console.log(file)
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
mongoose.connect(MongoURI).
then(result => {
    console.log('Connected!');
    const server = app.listen(3000);
	const io = require('./socket').init(server);
    io.on('connection',socket=>{
		if(socket.handshake.auth.userId){
			console.log("ID ",socket.id);
			console.log("USERID ",socket.handshake.auth.userId);
			SOCKETS_DATA.push({socketId:socket.id,userId:socket.handshake.auth.userId});
		}
//   socket.emit("users", users);
		socket.on("private message", ({ message, to,from }) => {
			const date = new Date();
			const hour = date.getHours();
			const minutes = date.getMinutes();
			let night = 'AM';
			if(hour>12==0){
				hour = hour - 12;
				night = 'PM';
			}
			const sentAt = hour.toString() + "." + minutes.toString() + ' ' + night;
			const newMessage = new Messages({sender:from,reciever:to,text:message,channelId:'fsociety',sentAt:sentAt});
		newMessage.save().then(result=>{
		console.log(result.createdAt.getHours());
		console.log(result.createdAt.getMinutes());
		const indx = SOCKETS_DATA.findIndex(s=>s.userId === to);
			
			if(indx!=-1){
				console.log(indx);
				console.log(SOCKETS_DATA[indx]);
				io.to(SOCKETS_DATA[indx].socketId).emit("private message", {
					message:message,
					from: from,
				  });		
			}
	}).catch(err=>{
		console.log(err);
	});			
		  });
		  socket.on("disconnect",()=>{
			console.log("SOCKET ID ",socket.id)
			SOCKETS_DATA = SOCKETS_DATA.filter(s=>s.socketId!==socket.id);
		  });
		});

}).catch(err => {
    console.log(err);
});