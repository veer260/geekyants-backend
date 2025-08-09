const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function userAuth(req, res, next){
    try {
    const {token} = req.cookies;
    if(!token) {
        throw new Error('Invalid token');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;
    if(!userId) {
        throw new Error('invalid user');
    }

    const user = await User.findOne({_id: userId});
    if(!user) {
        throw new Error('invalid user');
    }
    req.user = user;
        console.log(token);
        next();
        
    } catch (error) {
        res.status(404).send("user not authorised, log in again!" + error.message);
        
    }
   

}

module.exports = userAuth;