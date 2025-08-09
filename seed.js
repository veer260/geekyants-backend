require('dotenv').config();

const mongoose = require('mongoose');
const  Assignment  = require('./models/Assignment'); // Adjust path as needed
const  Project = require('./models/Project'); // Adjust path as needed
const  User = require('./models/User'); // Adjust path as needed
const bcrypt = require('bcrypt');


// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  await seedDatabase();
});

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Assignment.deleteMany();

    console.log('Cleared existing data');

    // Create manager
    const manager = await User.create({
      email: 'manager@company.com',
      name: 'Alex Rivera',
      password: 'manager123',
      role: 'manager',
      department: 'Engineering Leadership'
    });

    // Create 4 engineers with varied profiles
    const engineers = await User.create([
      {
        email: 'dev1@company.com',
        name: 'Taylor Swift',
        password: 'engineer1',
        role: 'engineer',
        skills: ['JavaScript', 'React', 'Node.js'],
        seniority: 'senior',
        maxCapacity: 100, // Full-time
        department: 'Frontend'
      },
      {
        email: 'dev2@company.com',
        name: 'Chris Evans',
        password: 'engineer2',
        role: 'engineer',
        skills: ['Python', 'Django', 'PostgreSQL'],
        seniority: 'mid',
        maxCapacity: 50, // Part-time (50%)
        department: 'Backend'
      },
      {
        email: 'dev3@company.com',
        name: 'Priyanka Kumar',
        password: 'engineer3',
        role: 'engineer',
        skills: ['Java', 'Spring Boot', 'AWS'],
        seniority: 'senior',
        maxCapacity: 100, // Full-time
        department: 'Cloud Engineering'
      },
      {
        email: 'dev4@company.com',
        name: 'Jamal Williams',
        password: 'engineer4',
        role: 'engineer',
        skills: ['Python', 'Machine Learning', 'TensorFlow'],
        seniority: 'junior',
        maxCapacity: 100, // Full-time
        department: 'Data Science'
      }
    ]);

    // Create 4 projects with different requirements
    const projects = await Project.create([
      {
        name: 'E-commerce Platform',
        description: 'Build new online store with React frontend',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        requiredSkills: ['React', 'Node.js'],
        teamSize: 4,
        status: 'active',
        managerId: manager._id
      },
      {
        name: 'Data Analytics Dashboard',
        description: 'Create internal analytics tool',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-08-15'),
        requiredSkills: ['Python', 'Machine Learning'],
        teamSize: 2,
        status: 'active',
        managerId: manager._id
      },
      {
        name: 'Mobile App Redesign',
        description: 'Update existing mobile application',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-11-30'),
        requiredSkills: ['React Native', 'TypeScript'],
        teamSize: 3,
        status: 'planning',
        managerId: manager._id
      },
      {
        name: 'API Gateway',
        description: 'Centralized API management system',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        requiredSkills: ['Java', 'AWS'],
        teamSize: 2,
        status: 'planning',
        managerId: manager._id
      }
    ]);

    // Create 8 assignments demonstrating different scenarios
    await Assignment.create([
      // Scenario 1: Full-time engineer with single project
      {
        engineerId: engineers[2]._id, // Priyanka (Java/AWS)
        projectId: projects[3]._id,   // API Gateway
        allocationPercentage: 80,
        startDate: projects[3].startDate,
        endDate: projects[3].endDate,
        role: 'Tech Lead'
      },
      
      // Scenario 2: Part-time engineer with single project
      {
        engineerId: engineers[1]._id, // Chris (Python/Django)
        projectId: projects[1]._id,   // Data Analytics
        allocationPercentage: 40,
        startDate: projects[1].startDate,
        endDate: projects[1].endDate,
        role: 'Backend Developer'
      },
      
      // Scenario 3: Full-time engineer with multiple projects
      {
        engineerId: engineers[0]._id, // Taylor (React/Node)
        projectId: projects[0]._id,   // E-commerce
        allocationPercentage: 60,
        startDate: projects[0].startDate,
        endDate: projects[0].endDate,
        role: 'Frontend Lead'
      },
      {
        engineerId: engineers[0]._id, // Taylor (React/Node)
        projectId: projects[2]._id,   // Mobile App
        allocationPercentage: 30,
        startDate: projects[2].startDate,
        endDate: projects[2].endDate,
        role: 'UI Consultant'
      },
      
      // Scenario 4: Junior engineer with single project
      {
        engineerId: engineers[3]._id, // Jamal (Python/ML)
        projectId: projects[1]._id,   // Data Analytics
        allocationPercentage: 70,
        startDate: projects[1].startDate,
        endDate: projects[1].endDate,
        role: 'Data Engineer'
      },
      
      // Scenario 5: Engineer with upcoming project
      {
        engineerId: engineers[1]._id, // Chris (Python/Django)
        projectId: projects[2]._id,   // Mobile App
        allocationPercentage: 10,
        startDate: projects[2].startDate,
        endDate: projects[2].endDate,
        role: 'Backend Consultant'
      },
      
      // Scenario 6: Engineer fully allocated
      {
        engineerId: engineers[2]._id, // Priyanka (Java/AWS)
        projectId: projects[0]._id,   // E-commerce
        allocationPercentage: 20,
        startDate: projects[0].startDate,
        endDate: projects[0].endDate,
        role: 'Architect'
      },
      
      // Scenario 7: Cross-department assignment
      {
        engineerId: engineers[3]._id, // Jamal (Python/ML)
        projectId: projects[0]._id,   // E-commerce
        allocationPercentage: 10,
        startDate: projects[0].startDate,
        endDate: projects[0].endDate,
        role: 'Data Specialist'
      }
    ]);

    console.log('\n✅ Database seeded successfully!');
    console.log('==================================');
    console.log('👨‍💼 Manager credentials:');
    console.log('Email: manager@company.com');
    console.log('Password: manager123\n');
    
    console.log('👩‍💻 Engineer credentials:');
    console.log('1. Taylor Swift (Frontend) - dev1@company.com / engineer1');
    console.log('2. Chris Evans (Backend, Part-time) - dev2@company.com / engineer2');
    console.log('3. Priyanka Kumar (Cloud) - dev3@company.com / engineer3');
    console.log('4. Jamal Williams (Data Science) - dev4@company.com / engineer4');
    console.log('==================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};