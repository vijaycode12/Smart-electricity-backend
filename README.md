Smart electricity tracker(WattTrack) Backend
REST API server for WattTrack — an electricity bill tracker that lets users manage bills, appliances, and view usage analytics.
Built with Node.js, Express, and MongoDB.

Tech Stack

Runtime — Node.js
Framework — Express.js
Database — MongoDB (Mongoose ODM)
Authentication — JWT (JSON Web Tokens)


Project Structure
├── controllers/        # Route handler logic
├── middleware/         # Auth middleware, error handlers
├── models/             # Mongoose schemas (User, Bill, Appliance)
├── routes/             # API route definitions
├── config/             # DB connection and env config
├── server.js           # Entry point
└── package.json

Getting Started
Prerequisites

Node.js v18+
MongoDB (local or Atlas)

Installation
bash# Clone the repo
git clone https://github.com/vijaycode12/Smart-electricity-backend.git


# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env
Environment Variables
Create a .env file in the root with the following:
envPORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
Run the Server
npm run dev

# Production
npm start
Server runs on http://localhost:5000 by default.



Authentication Flow

User registers or logs in via /api/auth
Server returns a signed JWT
Client sends the token in the Authorization header on every protected request
Auth middleware validates the token before passing the request to the controller


Scripts
bashnpm run dev     # Start with nodemon (development)
npm start       # Start normally (production)

Frontend
The frontend for Smart electricity app is a separate React app.
Repo: https://github.com/vijaycode12/Smart-electricity-frontend.git
