# 🚀 AI CLUB CMRTC - Live Tournament Quiz Platform

> **Live Arena for Battle of Bits '26**  
> **Venue**: CMRTC B-Block room no. 119  
> **Organized by**: AI CLUB CMRTC

---

## 📋 Prerequisites
Make sure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your system.
Check your version by running:
```bash
node -v
npm -v
```

---

## ⚡ Quick Start Guide (Run in 2 Steps)

### Step 1: Install Dependencies
Open a terminal (PowerShell, Command Prompt, or VS Code terminal) in the project folder and run:
```bash
npm run install:all
```
*(Or manually: `cd client && npm install`)*

---

### Step 2: Start the Development Server
```bash
npm run dev
```
Or to run just the Frontend (with all interactive features, audio, batches, and host projector):
```bash
cd client
npm run dev -- --host
```

Once running, your terminal will display:
- **Local Access**: `http://localhost:5173/`
- **Network / Mobile Access**: `http://192.168.x.x:5173/` *(or your local Wi-Fi IP)*

---

## 📱 How to Run for Auditorium Audience & Students

1. **Host Projector Screen (Admin Only)**:
   - Connect the host laptop to the auditorium projector in **Room 119**.
   - Navigate to `http://localhost:5173/host` (or log in via `/admin/login` and click **"Launch Projector"**).
   - Display the unique **Room PIN** and QR code on the big screen.

2. **Audience / Students (Mobile Devices)**:
   - Ensure student phones are connected to the same college Wi-Fi or hotspot.
   - Students open the browser and visit `http://<your-laptop-ip>:5173/play` (e.g. `http://192.168.1.15:5173/play`).
   - Enter the **Room PIN**, student name, and engineering branch (e.g., `CSE AI&ML`).
   - They appear in the live lobby instantly!

3. **During the Quiz**:
   - The question appears on the big projector and on student phones.
   - Questions change **only after all participants submit their answers** or the countdown timer expires.
   - After each question, a **compact Live Leaderboard** displays on the right side of both the host projector and student mobile screens with real-time score updates, ranks, and streaks!



### Multi-Round Batches System:
- **Round 1**: Screening Round (15 Core CS & AI fundamentals)
- **Round 2**: Technical Diagram Round (AI architecture & flowchart questions)
- **Round 3**: Grand Finale (Rapid-fire advanced prompt engineering & deep learning)
- Questions are **strictly confidential**: only admins can preview and edit questions before publishing.

---

## 🛠️ Build for Production
To generate an optimized production build:
```bash
cd client
npm run build
npm run preview -- --host
```
