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
            text:{
                type:String,
                required:true
            },
            sender:{
                type:Schema.Types.ObjectId,
                ref:'User'
            },
            sentAt:{
                type:String
            }
        },
        {timestamps:true}
    ]
},{timestamps:true});

module.exports = mongoose.model('Room',roomSchema);
//module.exports = mongoose.model("Message",messageSchema);