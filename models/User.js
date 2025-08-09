// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      required: true,
      enum: ['manager', 'engineer'],
      default: 'engineer'
    },
    // Engineer-specific fields
    skills: {
      type: [String],
      required: function() { return this.role === 'engineer'; },
      default: [],
      validate: {
        validator: function(skills) {
          return skills.every(skill => typeof skill === 'string');
        },
        message: props => `${props.value} contains non-string values`
      }
    },
    seniority: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
      required: function() { return this.role === 'engineer'; }
    },
    maxCapacity: {
      type: Number,
      required: function() { return this.role === 'engineer'; },
      validate: {
        validator: function(capacity) {
          return capacity === 50 || capacity === 100; // Part-time (50%) or Full-time (100%)
        },
        message: props => `${props.value} must be either 50 (part-time) or 100 (full-time)`
      }
    },
    department: {
      type: String,
      required: function() { return this.role === 'engineer'; }
    }
  }, {
    timestamps: true
  });

  // Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  });
  
  // Method to compare passwords
  userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

module.exports = mongoose.model('User', userSchema);