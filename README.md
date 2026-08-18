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

⚡ Installation
Install Dependencies
```bash
• Install backend deps
cd server
npm install

• Install frontend deps
cd ../client
npm install

🗝️ Environment Setup
Create .env in server folder:
MONGO_URI=your_mongodb_url
OPENAI_API_KEY=your_key
PORT=5000

🛜 API DOCS
Base URL: http://localhost:5000/api
Content-Type: application/json

🌱 Seeding Demo Data
To add sample users and meetings for testing:
cd server
npm run seed
This will create:
• Demo Room: demo123
• Test User: test@example.com / password: 123456

🚀 Deployment
Frontend - Vercel
• Push code to GitHub
• Import project in Vercel
• Set root directory to /client
• Add env variables

Backend- Render / Railway
• Create new Web Service
• Root Directory: /server
• Build: npm install
• Start: npm start
• Add MongoDB Atlas + OpenAI keys in Environment

📸 Screenshots
Add screenshots in /screenshots folder

🗺️ Future Roadmap
- [ ] **AI Features**: Live transcription, Action items, Sentiment analysis
- [ ] **Collaboration**: Meeting recording, File sharing in chat, Polls
- [ ] **Security**: E2E Encryption, Meeting passwords, Waiting room
- [ ] **Platform**: Mobile responsive UI, React Native App
- [ ] **Integrations**: Google Meet import, Slack bot, Calendar sync
- [ ] **Deployment**: Docker support, TURN server for global users

🤝 Contributing
Contributions are what make the open source community amazing!
• Fork the Project
• Create your Feature Branch (git checkout -b feature/AmazingFeature)
• Commit your Changes (git commit -m 'Add some AmazingFeature')
• Push to the Branch (git push origin feature/AmazingFeature)
• Open a Pull Request

📜 LICENSE
See LICENSE file


