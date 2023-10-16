const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
	const authHeader = req.get('Authorization')
	if(!authHeader){
		const error = new Error('Token not valid!!');
		error.statusCode = 401;
		throw error;
	}
	let decodedToken;
	try{
		const token = authHeader.split(" ")[1];
		decodedToken = jwt.verify(token,'elliotalderson')

	}
	catch(err){
		if(!err.statusCode){
			err.statusCode = 500;

		}
		throw err;
	}
	if(!decodedToken){
		const error = new Error('Not logged in!!!');
		error.statusCode = 401;
		throw error;
	}	
	req.userId = decodedToken.userId;
	next();	
};