const Assignment = require("../models/Assignment");
const User = require("../models/User");

async function getAvailableCapacity(engineerId) {
    const engineer = await User.findOne({_id: engineerId});
    const activeAssignments = await Assignment.find({engineerId}).exec();

    const totalAllocated = activeAssignments.reduce((sum, a) => sum + a.allocationPercentage,
    0);
    return {
        availableCapacity: engineer.maxCapacity - totalAllocated,
        assignments: activeAssignments
    } ;
    }
    

    module.exports = {getAvailableCapacity};