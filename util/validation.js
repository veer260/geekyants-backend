const {isEmail, isMongoId, isInt, isDate} = require('validator')

function validateLogin(emailId, password){
    
    if( !emailId || !password){
        throw new Error('incomplete details');
    }

    if(!isEmail(emailId)){
        throw new Error('Invalid email');
    }   


}

function validateProjectData(projectData) {
    const { name, description, startDate, endDate, requiredSkills, teamSize, status } = projectData;
    
    // Check for required fields
    if (!name || !description || !startDate || !endDate || !requiredSkills || !teamSize) {
        throw new Error('Missing required fields: name, description, startDate, endDate, requiredSkills, teamSize');
    }
    
    // Validate name
    if (typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 100) {
        throw new Error('Project name must be between 3 and 100 characters');
    }
    
    // Validate description
    if (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 1000) {
        throw new Error('Project description must be between 10 and 1000 characters');
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
    }
    
    if (start >= end) {
        throw new Error('End date must be after start date');
    }
    
    if (start < now) {
        throw new Error('Start date cannot be in the past');
    }
    
    // Validate required skills
    if (!Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        throw new Error('At least one required skill must be specified');
    }
    
    if (!requiredSkills.every(skill => typeof skill === 'string' && skill.trim().length > 0)) {
        throw new Error('All required skills must be non-empty strings');
    }
    
    // Validate team size
    if (!Number.isInteger(teamSize) || teamSize < 1 || teamSize > 20) {
        throw new Error('Team size must be between 1 and 20');
    }
    
    // Validate status
    const validStatuses = ['planning', 'active', 'completed'];
    if (status && !validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be one of: planning, active, completed');
    }
    
    // Sanitize data
    return {
        name: name.trim(),
        description: description.trim(),
        startDate: start,
        endDate: end,
        requiredSkills: requiredSkills.map(skill => skill.trim()),
        teamSize: parseInt(teamSize),
        status: status || 'planning'
    };
}

function validateAssignmentData(assignmentData) {
    const { engineerId, projectId, allocationPercentage, startDate, endDate, role } = assignmentData;
    
    // Check for required fields
    if (!engineerId || !projectId || !allocationPercentage || !startDate || !endDate || !role) {
        throw new Error('Missing required fields: engineerId, projectId, allocationPercentage, startDate, endDate, role');
    }
    
    // Validate MongoDB ObjectIds
    if (!isMongoId(engineerId)) {
        throw new Error('Invalid engineer ID format');
    }
    
    if (!isMongoId(projectId)) {
        throw new Error('Invalid project ID format');
    }
    
    // Validate allocation percentage
    if (!isInt(allocationPercentage.toString(), { min: 1, max: 100 })) {
        throw new Error('Allocation percentage must be an integer between 1 and 100');
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (!isDate(start) || !isDate(end)) {
        throw new Error('Invalid date format');
    }
    
    if (start >= end) {
        throw new Error('End date must be after start date');
    }
    
    if (start < now) {
        throw new Error('Start date cannot be in the past');
    }
    
    // Validate role
    if (typeof role !== 'string' || role.trim().length < 2 || role.trim().length > 50) {
        throw new Error('Role must be between 2 and 50 characters');
    }
    
    // Sanitize data
    return {
        engineerId: engineerId.trim(),
        projectId: projectId.trim(),
        allocationPercentage: parseInt(allocationPercentage),
        startDate: start,
        endDate: end,
        role: role.trim()
    };
}

module.exports = {
    validateLoginData: validateLogin,
    validateProjectData: validateProjectData,
    validateAssignmentData: validateAssignmentData
}