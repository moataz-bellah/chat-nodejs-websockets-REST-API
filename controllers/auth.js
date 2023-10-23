const {validationResult} = require('express-validator');
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Room = require('../models/room');
const Message = require('../models/message');
exports.signup = (req,res,next)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		const error = new Error('Validation failed!!');
		error.statusCode = 422;
		error.data = errors.data();
		throw error;
	}
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;
	const user = new User({email:email,name:name,password:password})
	user.save().then(result=>{
		res.status(201).json({message:'User created',userId:result._id})	
	}).catch(err=>{
		console.log(err);
	});
	
};


exports.login = (req,res,next)=>{
	const email = req.body.email;
	const password = req.body.password;
	User.findOne({email:email}).then(user=>{
			if(!user){
				const error = new Error('No user exists!!');
				error.statusCode = 401;
				throw error;
			}
			if(user.password === password){
				const token = jwt.sign({email:user.email,userId:user._id.toString()},'elliotalderson',{expiresIn:'1h'});
				// const newRoom = new Room({name:'fsociety',password:'admin'});
				// newRoom.save().then(result=>{
				// 	console.log(result);
					
				// }).catch(err=>{
				// 	console.log(err);
				// });
				res.status(200).json({message:'User logged in successfully',token:token,userId:user._id.toString()});
			}
			else{
				const error = new Error('Password not correct!!!');
				error.statusCode = 401;
				throw error;
			}
	}).catch(err=>{
		console.log(err);
		if(!err.statusCode){
			err.statusCode = 500;
		}
		next(err);
	})
};