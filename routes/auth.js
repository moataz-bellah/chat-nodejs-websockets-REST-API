const express = require('express');
const {check,body} = require('express-validator');
const router = express.Router();
const User = require('../models/user');
const isAuth = require('../middlewares/is-auth');
const authController = require('../controllers/auth');

router.post('/signup',[
		body('email').trim().isEmail().
		withMessage('Please enter a valid email').custom((value,{req})=>{
			return User.findOne({email:value}).then(userDoc=>{
					if(userDoc){
						return Promise.reject("Email already exists")
					}
			})
		})
	],authController.signup);
router.post('/login',[
		body('email').trim().isEmail().withMessage('Please enter a valid email')
	],authController.login);
router.post('/logout',isAuth,authController.logout);
module.exports = router;