// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A project must have a name'],
      trim: true,
      maxlength: [100, 'Project name must be less than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'A project must have a description'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'A project must have a start date'],
      validate: {
        validator: function(date) {
          return date < this.endDate;
        },
        message: 'Start date must be before end date'
      }
    },
    endDate: {
      type: Date,
      required: [true, 'A project must have an end date']
    },
    requiredSkills: {
      type: [String],
      required: [true, 'A project must specify required skills'],
      validate: {
        validator: function(skills) {
          return skills.length > 0;
        },
        message: 'At least one skill is required'
      }
    },
    teamSize: {
      type: Number,
      required: [true, 'A project must specify team size'],
      min: [1, 'Team size must be at least 1']
    },
    status: {
      type: String,
      required: [true, 'A project must have a status'],
      enum: {
        values: ['planning', 'active', 'completed'],
        message: 'Status must be either planning, active, or completed'
      },
      default: 'planning'
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project must have a manager'],
      validate: {
        validator: async function(managerId) {
          const user = await mongoose.model('User').findById(managerId);
          return user && user.role === 'manager';
        },
        message: 'Manager must be a user with manager role'
      }
    }
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  // Virtual populate assignments
  projectSchema.virtual('assignments', {
    ref: 'Assignment',
    foreignField: 'projectId',
    localField: '_id'
  });

module.exports = mongoose.model('Project', projectSchema);