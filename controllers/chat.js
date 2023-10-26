const User = require('../models/user')
const Messages = require('../models/message'); 
const path = require('path')
const fs = require('fs')
// const io = require('../socket');
const Channel = require('../models/channel');
const Room = require('../models/room');
exports.getMessages = (req,res,next)=>{
	const recieverId = req.body.recieverId;
	const sender = req.userId;
	Messages.find({sender:[sender,recieverId],reciever:[sender,recieverId]}).then(result=>{
		res.status(200).json({messages:result});
	}).catch(err=>{
		console.log(err);
	})
};

// exports.sendMessage = (req,res,next)=>{
// 	const message = req.body.message;
// 	const sender = req.userId;
// 	const reciever = req.body.recieverId;

// 	const newMessage = new Messages({sender:sender,reciever:reciever,text:message,channelId:'fsociety'});
// 	newMessage.save().then(result=>{
// 		// io.getIO().emit("send-message",{action:"message sent",message:result});
// 		res.status(201).json({statusMessage:'Message sent successfully'})
// 	}).catch(err=>{
// 		console.log(err);
// 	});

// };

exports.sendMessage = (from,to,message,sentAt)=>{
	const newMessage = new Messages({sender:from,reciever:to,text:message,channelId:'fsociety',sentAt:sentAt});
	return newMessage.save();
};

exports.getFriends = (req,res,next)=>{
	let friends = [];
	
	User.find().then(data=>{
		friends = data.filter(friend=>friend._id.toString() !== req.userId.toString());
				res.status(200).json({friends:friends});
	}).catch(err=>{
		console.log(err);
	});

	// User.findOne({_id:req.userId}).populate('friends').then(data=>{
	// 			friends = data.filter(friend=>friend._id !== req.userId);
	// 			res.status(200).json({friends:data.friends});
	// }).catch(err=>{
	// 	console.log(err);
	// });
};

exports.getRooms = (req,res,next)=>{
	Room.find().then(rooms=>{
		res.status(200).json({rooms:rooms});
	}).catch(err=>{
		console.log(err);
	});
};

exports.getRoomMessages = (req,res,next)=>{
	const roomId = req.body.roomId;
	Room.findById(roomId).populate('messages').then(result=>{
		res.status(200).json({messages:result.messages});
	}).catch(err=>{
		console.log(err);
	});
};
exports.sendRoomMessage = (roomId,from,message,sentAt)=>{
	Room.findById(roomId).then(room=>{
		const newMessage = {sender:from,text:message,sentAt:sentAt};
		room.messages.push(newMessage);
		return room.save();
	}).catch(err=>{
		console.log(err);
	});
	
};
exports.getPeople = (req,res,next) => {
	User.findById(req.userId).then(user=>{
		User.find().then(users=>{
			const people = users.filter(u=> !user.friends.includes(u._id) && u._id != req.userId);
			res.status(200).json({people:people});
		}).catch(err=>{
			console.log(err);
		});
	}).catch(err=>{
		console.log(err);
	});
	
};


exports.addFriend = (req,res,next) => {
		const friendId = req.body.friendId;
		let channel;
		User.findById(req.userId).then(user=>{
			user.friends.push(friendId);
			channel = new Channel({channelKey:friendId.toString() + req.userId.toString(),title:'FSocity',members:[friendId,req.userId]});
			return user.save();
		}).then(result=>{
			return channel.save();
		}).then(res=>{
			res.status(201).json({channel:res})
		}).catch(err=>{
			console.log(err);
		})

};


const deleteImage = (imagePath)=>{
	filePath = path.join(__dirname,'..',imagePath)
	fs.unlink(filePath,err=>console.log(err));
};



// 65020c7a7ac49816692e34c9

// 65020c9e7ac49816692e34cc