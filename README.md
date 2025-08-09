# Basic Express Server with MongoDB

A simple Express.js server with MongoDB connection using Mongoose.

## Installation

1. Install dependencies:
```bash
npm install
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Create a `.env` file in the root directory:
```
mongoURI=your_mongodb_atlas_connection_string
```

### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The default connection will be `mongodb://localhost:27017/myapp`

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 **only after** successful MongoDB connection.

## Available Endpoints

### GET `/`
- **Description**: Basic hello world endpoint
- **Response**: `{ "message": "Hello World!" }`

## Example Usage

### Start the server in development mode
```bash
npm run dev
```

### Test the endpoint
```bash
curl http://localhost:3000/
```

## Project Structure

```
backend/
├── config/
│   └── database.js    # MongoDB connection configuration
├── models/
│   └── User.js        # Sample User model
├── index.js           # Main server file
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variables
- **nodemon**: Development dependency for auto-reload 