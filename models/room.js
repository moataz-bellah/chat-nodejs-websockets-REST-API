const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Message = require('./message');
const roomSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String
    },
    members:[
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    messages:[
        {
            type:Schema.Types.ObjectId,
            ref:'Message'
        }
    ]
},{timestamps:true});

module.exports = mongoose.model('Room',roomSchema);
//module.exports = mongoose.model("Message",messageSchema);