const express = require('express');
const { validateLoginData } = require('../util/validation');
const authRouter = express.Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userAuth = require('../middlewares/userAuth');

authRouter.post('/login', async(req, res) => {
    try{
    const {email, password} = req.body;
    if(!email || !password) {
        res.status(400).json({message: "Email and password are required"});
    }
    validateLoginData(email, password);

    const user = await User.findOne({
        email
    }).select('+password')
    if(!user) {
        throw new Error("invalid credentials");
    }
    console.log({user});

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect) {
        throw new Error("invalid credentials");
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Set token as HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
  secure: false, // Must be false because your frontend is HTTP localhost
  sameSite: 'lax', // Change from 'none' to 'lax'
  maxAge: 24 * 60 * 60 * 1000
    });

    // Return user data for localStorage (excluding password)
    res.status(200).json({
        status: "success",
        message: "User successfully logged in!",
        user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            skills: user.skills,
            seniority: user.seniority,
            maxCapacity: user.maxCapacity
        }
    });


    }catch(err){
        console.log(err);
        res.status(401).json({
            status: "failure",
            message: 'error in loggin in',
            error: err
        })

    }
    
    
    

});
authRouter.post('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    
    res.status(200).json({
        status: "success",
        message: "User successfully logged out!"
    });
});

authRouter.get('/profile', userAuth, (req, res) => {
    try {
        const userProfile = req.user;
        res.status(200).send(userProfile);
    } catch (error) {
        res.status(400).send("Error in fetching profile: "+ error.message);
    }
});

module.exports = authRouter;