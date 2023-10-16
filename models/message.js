const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const messageSchema = new Schema({
	sender:{
		type: Object,
		required:true
	},
	reciever:{
		type:Object,
		required:true
	},
	text:{
		type:String,
		required:true
	},
	channelId:{
		type:String,
	}
},{timestamps:true});
module.exports = mongoose.model("Message",messageSchema);