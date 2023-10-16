const mongoose = require('mongoose');
const Schema = mongoose.Schema;
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

module.exports = mongoose.Model('Room',roomSchema);