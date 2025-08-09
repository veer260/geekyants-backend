const express = require('express');
const userAuth = require('../middlewares/userAuth');
const User = require('../models/User');
const { getAvailableCapacity } = require('../util/getCapacity');
const engineerRouter = express.Router();

engineerRouter.get('/:id/capacity', userAuth, async(req,res) => {
    try {
    const {id} = req.params;
    const user = req.user;
 
    if(user.role == 'engineer' && user._id.toString() !== id) {
        return res.status(403).json({
            status: 'failure',
            data: null,
            message: 'You can only view your own capacity',
            error: 'Unauthorized'
          });
    }
    if(!id || id.trim() === '') {
        return res.status(400).json({
            status: 'failure',
            data: null,
            message: 'Invalid or missing engineer ID'
          });
    }
    const {availableCapacity, assignments} = await getAvailableCapacity(id);
    res.status(200).json({
        status: 'success',
        data: {
            assignments,
            availableCapacity
        },
        message: 'fetched availabe capacity',
        error: null
    })  
    } catch (error) {
        res.status(400).json({
            status: 'failure',
            data: null,
            message: 'error in fetching available capacity',
            error: error.message
        })   
    }    
})

engineerRouter.get('/', userAuth, async(req, res) => {
    // res.send("got data for all engineers");
    try {
        const engineers = await User.find({role: 'engineer'}).exec();
        if(engineers.length == 0){
            throw new Error('no engineer found!');
        }
        res.status(200).json({
            status: 'success',
            data: engineers,
            message: 'engineers fetched'
        })
        
    } catch (error) {
        res.status(404).json({
            status: 'failure',
            data: {},
            message: "engineers not found",
            error: error.message
        })
        
    }

});


module.exports = engineerRouter;
