const express = require('express');
const userAuth = require('../middlewares/userAuth');
const Assignment = require('../models/Assignment');
const Project = require('../models/Project');
const User = require('../models/User');
const requireRole = require('../middlewares/requireRole');
const { validateAssignmentData } = require('../util/validation');
const assignmentsRouter = express.Router();

// GET /api/assignments - Get all assignments (managers can see all, engineers see their own)
assignmentsRouter.get('/', userAuth, async(req, res) => {
    try {
        const user = req.user;
        let assignments;

        if (user.role === 'manager') {
            // Managers can see all assignments
            assignments = await Assignment.find()
                .populate('engineerId', 'name email department skills seniority')
                .populate('projectId', 'name description status startDate endDate')
                .exec();
        } else {
            // Engineers can only see their own assignments
            assignments = await Assignment.find({ engineerId: user._id })
                .populate('engineerId', 'name email department skills seniority')
                .populate('projectId', 'name description status startDate endDate')
                .exec();
        }

        return res.status(200).json({
            status: 'success',
            message: 'Assignments fetched successfully',
            data: {
                assignments
            },
            error: null
        });

    } catch (error) {
        console.log('Error fetching assignments:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Error fetching assignments',
            data: null,
            error: error.message
        });
    }
});

// POST /api/assignments - Create new assignment (managers only)
assignmentsRouter.post('/', userAuth, requireRole(['manager']), async(req, res) => {
    try {
        const assignmentData = req.body;

        // Validate and sanitize the assignment data
        const validatedData = validateAssignmentData(assignmentData);

        // Check if engineer exists and is actually an engineer
        const engineer = await User.findById(validatedData.engineerId);
        if (!engineer || engineer.role !== 'engineer') {
            return res.status(400).json({
                status: 'failure',
                message: 'Invalid engineer',
                data: null,
                error: 'Engineer not found or user is not an engineer'
            });
        }

        // Check if project exists
        const project = await Project.findById(validatedData.projectId);
        if (!project) {
            return res.status(400).json({
                status: 'failure',
                message: 'Invalid project',
                data: null,
                error: 'Project not found'
            });
        }

        // Check if assignment already exists for this engineer and project
        const existingAssignment = await Assignment.findOne({
            engineerId: validatedData.engineerId,
            projectId: validatedData.projectId
        });

        if (existingAssignment) {
            return res.status(400).json({
                status: 'failure',
                message: 'Assignment already exists',
                data: null,
                error: 'Engineer is already assigned to this project'
            });
        }

        // Check engineer's current allocation
        const currentAssignments = await Assignment.find({ engineerId: validatedData.engineerId });
        const currentAllocation = currentAssignments.reduce((sum, assignment) => sum + assignment.allocationPercentage, 0);
        
        if (currentAllocation + validatedData.allocationPercentage > engineer.maxCapacity) {
            return res.status(400).json({
                status: 'failure',
                message: 'Engineer over-allocated',
                data: null,
                error: `Engineer is already allocated ${currentAllocation}%. Cannot add ${validatedData.allocationPercentage}% more.`
            });
        }

        // Create new assignment
        const newAssignment = new Assignment(validatedData);

        const savedAssignment = await newAssignment.save();

        // Populate the saved assignment for response
        const populatedAssignment = await Assignment.findById(savedAssignment._id)
            .populate('engineerId', 'name email department skills seniority')
            .populate('projectId', 'name description status startDate endDate');

        return res.status(201).json({
            status: 'success',
            message: 'Assignment created successfully',
            data: populatedAssignment,
            error: null
        });

    } catch (error) {
        console.log('Error creating assignment:', error);
        
        // Handle validation errors specifically
        if (error.message.includes('Missing required fields') || 
            error.message.includes('Invalid engineer ID format') ||
            error.message.includes('Invalid project ID format') ||
            error.message.includes('Allocation percentage must be') ||
            error.message.includes('Invalid date format') ||
            error.message.includes('End date must be') ||
            error.message.includes('Start date cannot be') ||
            error.message.includes('Role must be between')) {
            return res.status(400).json({
                status: 'failure',
                message: 'Validation error',
                data: null,
                error: error.message
            });
        }
        
        return res.status(500).json({
            status: 'failure',
            message: 'Error creating assignment',
            data: null,
            error: error.message
        });
    }
});

// PUT /api/assignments/:id - Update assignment (managers only)
assignmentsRouter.put('/:id', userAuth, requireRole(['manager']), async(req, res) => {
    try {
        const { id } = req.params;
        const { allocationPercentage, startDate, endDate, role } = req.body;

        // Find the assignment
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({
                status: 'failure',
                message: 'Assignment not found',
                data: null,
                error: 'Assignment with this ID does not exist'
            });
        }

        // Validate allocation percentage if provided
        if (allocationPercentage !== undefined) {
            if (allocationPercentage < 1 || allocationPercentage > 100) {
                return res.status(400).json({
                    status: 'failure',
                    message: 'Invalid allocation percentage',
                    data: null,
                    error: 'Allocation percentage must be between 1 and 100'
                });
            }

            // Check engineer's current allocation (excluding this assignment)
            const currentAssignments = await Assignment.find({ 
                engineerId: assignment.engineerId,
                _id: { $ne: id } // Exclude current assignment
            });
            const currentAllocation = currentAssignments.reduce((sum, assignment) => sum + assignment.allocationPercentage, 0);
            
            if (currentAllocation + allocationPercentage > assignment.engineerId.maxCapacity) {
                return res.status(400).json({
                    status: 'failure',
                    message: 'Engineer over-allocated',
                    data: null,
                    error: `Engineer is already allocated ${currentAllocation}%. Cannot set to ${allocationPercentage}%.`
                });
            }
        }

        // Update the assignment
        const updateData = {};
        if (allocationPercentage !== undefined) updateData.allocationPercentage = allocationPercentage;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (role !== undefined) updateData.role = role;

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('engineerId', 'name email department skills seniority')
         .populate('projectId', 'name description status startDate endDate');

        return res.status(200).json({
            status: 'success',
            message: 'Assignment updated successfully',
            data: updatedAssignment,
            error: null
        });

    } catch (error) {
        console.log('Error updating assignment:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Error updating assignment',
            data: null,
            error: error.message
        });
    }
});

// DELETE /api/assignments/:id - Delete assignment (managers only)
assignmentsRouter.delete('/:id', userAuth, requireRole(['manager']), async(req, res) => {
    try {
        const { id } = req.params;

        // Find the assignment
        const assignment = await Assignment.findById(id);
        if (!assignment) {
            return res.status(404).json({
                status: 'failure',
                message: 'Assignment not found',
                data: null,
                error: 'Assignment with this ID does not exist'
            });
        }

        // Delete the assignment
        await Assignment.findByIdAndDelete(id);

        return res.status(200).json({
            status: 'success',
            message: 'Assignment deleted successfully',
            data: null,
            error: null
        });

    } catch (error) {
        console.log('Error deleting assignment:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Error deleting assignment',
            data: null,
            error: error.message
        });
    }
});

module.exports = assignmentsRouter; 