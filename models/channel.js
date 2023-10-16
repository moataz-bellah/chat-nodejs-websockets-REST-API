const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const channelSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    channelKey:{
        type:String,
        required:true
    },
    members:[
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    category:{
        type:String
    }
},{timestamps:true});
module.exports = mongoose.model('Channel',channelSchema)