const express = require('express');
const mongoose =  require('mongoose')
const userAuth = require('../middlewares/userAuth');
const Project = require('../models/Project');
const Assignment = require('../models/Assignment');
const requireRole = require('../middlewares/requireRole');
const { validateProjectData } = require('../util/validation');
const { getAvailableCapacity } = require('../util/getCapacity');
const projectsRouter = express.Router();


projectsRouter.get('/:projectId/team', userAuth, requireRole(['manager']), async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({
                status: 'failure',
                message: 'Project ID is required',
                data: null,
                error: 'Project ID not provided'
            });
        }

        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                status: 'failure',
                message: 'Project not found',
                data: null,
                error: 'Project with this ID does not exist'
            });
        }

        // Get unique engineers assigned to this project
        const assignments = await Assignment.find({ projectId })
            .populate('engineerId', 'name email department skills seniority maxCapacity')
            .exec();

        if (!assignments.length) {
            return res.status(200).json({
                status: 'success',
                message: 'No team members assigned to this project',
                data: { project, teamMembers: [] },
                error: null
            });
        }

        // Unique engineers
        const engineersMap = new Map();
        for (const assignment of assignments) {
            const eng = assignment.engineerId;
            engineersMap.set(eng._id.toString(), eng);
        }

        const engineerIds = [...engineersMap.keys()];

        // Fetch available capacity for each engineer
        const capacities = await Promise.all(
            engineerIds.map(id => getAvailableCapacity(id))
        );

        // Build the final team members array
        const teamMembers = engineerIds.map((id, idx) => {
            const eng = engineersMap.get(id);
            const availableCapacity = capacities[idx].availableCapacity;
            const currentAllocation = eng.maxCapacity - availableCapacity;

            return {
                _id: eng._id,
                name: eng.name,
                email: eng.email,
                department: eng.department,
                skills: eng.skills,
                seniority: eng.seniority,
                maxCapacity: eng.maxCapacity,
                currentAllocation,
                availableCapacity
            };
        });

        return res.status(200).json({
            status: 'success',
            message: 'Team members fetched successfully',
            data: {
                project: {
                    _id: project._id,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    startDate: project.startDate,
                    endDate: project.endDate,
                    requiredSkills: project.requiredSkills,
                    teamSize: teamMembers.length
                },
                teamMembers
            },
            error: null
        });

    } catch (error) {
        console.error('Error fetching project team:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Error fetching project team',
            data: null,
            error: error.message
        });
    }
});


projectsRouter.get('/', userAuth, requireRole(['manager']), async(req, res) => {
    
    try {
        const manager = req.user;
        const projects = await Project.find({managerId: manager._id}).exec();

        return res.status(200).json({
            status: 'success',
            message: 'fetched projects',
            data: {
                projects
            }, 
            error: null

        });
    } catch (error) {
        console.log(error);
        return res.status(400).send("failure");

        
    }
});

// POST route for creating a new project
projectsRouter.post('/', userAuth, requireRole(['manager']), async(req, res) => {
    try {
        const manager = req.user;
        const projectData = req.body;
        
        // Validate and sanitize the project data
        const validatedData = validateProjectData(projectData);
        
        // Create the new project with manager ID
        const newProject = new Project({
            ...validatedData,
            managerId: manager._id
        });
        
        // Save the project to database
        const savedProject = await newProject.save();
        
        return res.status(201).json({
            status: 'success',
            message: 'Project created successfully',
            data: savedProject,
            error: null
        });
        
    } catch (error) {
        console.log('Project creation error:', error);
        
        // Handle validation errors specifically
        if (error.message.includes('Missing required fields') || 
            error.message.includes('Project name must be') ||
            error.message.includes('Project description must be') ||
            error.message.includes('Invalid date') ||
            error.message.includes('End date must be') ||
            error.message.includes('Start date cannot be') ||
            error.message.includes('required skill') ||
            error.message.includes('Team size must be') ||
            error.message.includes('Invalid status')) {
            return res.status(400).json({
                status: 'failure',
                message: 'Validation error',
                data: null,
                error: error.message
            });
        }
        
        return res.status(500).json({
            status: 'failure',
            message: 'Error creating project',
            data: null,
            error: error.message
        });
    }
});

module.exports = projectsRouter;