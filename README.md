# IntellMeet - AI-Powered Enterprise Meeting & Collaboration Platform

IntellMeet is a real-time video conferencing and collaboration platform built for enterprises. It transforms meetings into actionable and efficient business outcomes using AI.

 ## 🚀 Features
- **Real-time Video Conferencing** - WebRTC based peer-to-peer video calls
- **Live Chat** - Socket.io powered instant messaging during meetings  
- **Screen Sharing** - Share screen with all participants
- **AI Meeting Assistant** - OpenAI integration for summaries
- **Room System** - Create and join meetings with room IDs

## 🛠️ Tech Stack
**Frontend:** React, Vite, TailwindCSS, WebRTC  
**Backend:** Node.js, Express, Socket.io  
**Database:** MongoDB  
**AI:** OpenAI API  

## ⚙️ Setup Instructions
### Clone Repository
```bash
git clone https://github.com/SonuPatelNL/IntellMeet.git
cd IntellMeet
```

## Installation
```bash
git clone https://github.com/SonuPatelNL/IntellMeet.git
cd IntellMeet

# Backend
cd backend
npm install
# create .env - see below
npm run dev

# Frontend - new terminal
cd ../frontend
npm install
npm run dev
```

## Environment Setup
Create a .env file in /server and /client
/server/.env
PORT=5000
MONGO_URL=mongodb://localhost:27017/intellmeet
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-your-openai-key
CORS_ORIGIN=http://localhost:5176

/client/.env
VITE_SERVER_URL=http://localhost:5000
VITE_OPENAI_API_KEY=your_openai_key_if_needed_on_frontend
