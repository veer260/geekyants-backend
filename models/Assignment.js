// backend/models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An assignment must have an engineer'],
      validate: {
        validator: async function(engineerId) {
          const user = await mongoose.model('User').findById(engineerId);
          return user && user.role === 'engineer';
        },
        message: 'Engineer must be a user with engineer role'
      }
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'An assignment must have a project']
    },
    allocationPercentage: {
      type: Number,
      required: [true, 'An assignment must specify allocation percentage'],
      min: [1, 'Allocation must be at least 1%'],
      max: [100, 'Allocation cannot exceed 100%']
    },
    startDate: {
      type: Date,
      required: [true, 'An assignment must have a start date'],
      validate: {
        validator: function(date) {
          return date < this.endDate;
        },
        message: 'Start date must be before end date'
      }
    },
    endDate: {
      type: Date,
      required: [true, 'An assignment must have an end date']
    },
    role: {
      type: String,
      required: [true, 'An assignment must specify the role'],
      trim: true,
      maxlength: [50, 'Role must be less than 50 characters']
    }
  }, {
    timestamps: true
  });
  
  // Indexes for performance
  assignmentSchema.index({ engineerId: 1 });
  assignmentSchema.index({ projectId: 1 });
  assignmentSchema.index({ engineerId: 1, projectId: 1 }, { unique: true });
  
  // Prevent duplicate assignments
  assignmentSchema.pre('save', async function(next) {
    const existingAssignment = await mongoose.model('Assignment').findOne({
      engineerId: this.engineerId,
      projectId: this.projectId
    });
    
    if (existingAssignment && !existingAssignment._id.equals(this._id)) {
      const err = new Error('Engineer is already assigned to this project');
      next(err);
    } else {
      next();
    }
  });

module.exports = mongoose.model('Assignment', assignmentSchema);