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

## ⚡Installation
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

## 🔑 Environment Setup

Create a .env file in /server and /client

### /server/.env
```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/intellmeet
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=sk-your-openai-key
CORS_ORIGIN=http://localhost:5176
```

### /client/.env
```
VITE_SERVER_URL=http://localhost:5000
VITE_OPENAI_API_KEY=your_openai_key_if_needed_on_frontend
```

## 🌱 Seeding Demo Data

To add simple meetings and users for testing:
```
cd server
npm run seed
```
This will create 2 meeting rooms:
demo-room-1, demo-room-2 with password 1234 

## 📡 API Docs

Base URL: `http://localhost:5000/api`
Live: `https://intellmeet-1-8c0f.onrender.com`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user |
| GET | `/meetings` | Get all meetings |
| POST | `/meetings` | Create meeting |
| GET | `/meetings/:id` | Get meeting by ID |
| DELETE | `/meetings/:id` | Delete meeting |
| POST | `/ai/summarize` | Summarize meeting |

**Auth Header:** `Authorization: Bearer <token>`

## 🚀  Deployment

### Frontend - Vercel
- Push code to GuitHub
- Import project in Vercel
- Set root directory: /client
- Add env variables from .env

### Backend - Render / Railway
- Import /server folder
- Set Build Command: npm install
- Start Command: npm start
- Add MONGO_URL, OPENAI_API_KEY in Environment

## 📸 Screenshots
Add your Screenshots to /screenshots folder

## 🗺️ Future Roadmap

- [ ] Zoom / Google Meet integration
- [ ] Real-time transcription
- [ ] Mobile app (React Native)
- [ ] Team collaboration

## 🤝 Contributing

Contributions are welcome!

1. Fork this repo
2. Create new branch
3. Make your changes
4. Submit a Pull Request

## 📜 License
This project is licensed under the MIT License
