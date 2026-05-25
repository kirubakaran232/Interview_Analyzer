<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7c3aed,50:06b6d4,100:14b8a6&height=300&section=header&text=AI%20Career%20Coach&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=45&desc=Full-Stack%20AI%20Interview%20Preparation%20Platform&descAlignY=65&descSize=20" width="100%"/>

<br/>

# 🚀 AI Career Coach Platform

### *Your 24/7 AI-Powered Placement Companion*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_API-AI-8B5CF6?style=for-the-badge&logo=googlebard&logoColor=white)](https://ai.google.dev/)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-0A0A0A?style=for-the-badge)](https://your-demo-link.com)
[![Report Bug](https://img.shields.io/badge/🐞_Report_Bug-GitHub_Issues-red?style=for-the-badge)](https://github.com/your-username/Interview-Analyzer/issues)
[![Request Feature](https://img.shields.io/badge/✨_Request_Feature-Discussions-blue?style=for-the-badge)](https://github.com/your-username/Interview-Analyzer/discussions)

### 🌟 Star the Repo if you find it useful! 🌟

</div>

---

## 📖 Overview

**AI Career Coach** is a **final-year-project** and **portfolio-ready** web application designed to be a **one-stop solution** for placement preparation. Unlike basic quiz apps, it simulates the **complete stress and dynamics** of real interviews.

✨ **Why this project is a game-changer:**
- 🎯 **Realistic Simulation:** Practice with camera, speech, and AI-driven dynamic questions—not static Q&A banks.
- 🧠 **AI-Powered Feedback:** Get detailed, actionable feedback on your answers, code, body language, and fluency.
- 📈 **Progress Tracking:** MongoDB saves your history, allowing you to visualize improvement over time.
- 🧩 **Modular Design:** Each module (Coding, Aptitude, GD, HR) is independent, making the codebase clean, scalable, and easy to maintain.

---

## 🧩 Live Modules

| Module | Status | 🎯 What It Does |
| :--- | :---: | :--- |
| 🎤 **Interview Judger** | ✅ Active | Simulates HR + Technical interviews with camera, speech analysis, AI questions, and scoring. |
| 📄 **Resume Analyzer** | ✅ Active | Extracts text from PDF/DOCX, calculates ATS score, and provides suggestions for improvement. |
| 💻 **Coding Interview + DSA** | ✅ Active | Generates coding problems, provides AI hints, reviews code, and tracks progress on a 200+ DSA roadmap. |
| 🧮 **Aptitude Practice** | ✅ Active | Generates dynamic aptitude questions with shortcuts, explanations, mock tests, and analytics. |
| 🗣️ **Group Discussion Judger** | ✅ Active | Simulates GD rounds with AI participants and evaluates content, leadership, and clarity. |
| 🎙️ **Communication Trainer** | ✅ Active | Trains English fluency, grammar, filler-word detection, tone, and professional speaking. |
| 🤝 **HR Round Practice** | ✅ Active | Practices behavioral and situational HR questions with STAR-method feedback. |

---

## 🎮 User Flow & Screens

```mermaid
flowchart TD
    A["🏠 Landing Page"] --> B["🔐 Login / Signup"]
    B --> C["📊 Dashboard"]
    
    C --> D["🎤 Interview Judger"]
    C --> E["📄 Resume Analyzer"]
    C --> F["💻 Coding Interview"]
    C --> G["🧮 Aptitude Practice"]
    C --> H["🗣️ Group Discussion"]
    C --> I["🎙️ Communication Trainer"]
    C --> J["🤝 HR Round Practice"]
    
    D --> K["📈 Results + History"]
    E --> L["📊 ATS Report"]
    F --> M["📈 DSA Progress"]
    G --> N["📊 Practice Analytics"]
    H --> O["💬 GD Feedback"]
    I --> P["📈 Fluency Report"]
    J --> Q["💯 HR Readiness Score"]

---

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Monaco Editor
- Lucide React Icons
- MediaPipe Face Mesh / Pose
- Web Speech API

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Firebase Admin SDK
- Gemini API
- Multer
- pdf-parse
- Mammoth

### Authentication and AI

- Firebase Authentication for login/signup
- Firebase Admin for backend token verification
- Gemini API / Google AI Studio free tier for AI generation and evaluation

---

## Architecture

```mermaid
flowchart LR
    U["User"] --> FE["React + Tailwind Client"]
    FE --> FA["Firebase Auth"]
    FE --> MP["MediaPipe + Web Speech API"]
    FE --> API["Express API"]
    API --> FB["Firebase Admin Token Verify"]
    API --> DB["MongoDB Atlas"]
    API --> AI["Gemini API"]
    API --> PDF["PDF / DOCX Text Extraction"]
```

### Design style

- Modular routes
- Separate service files for AI calls
- Separate prompt files for each AI module
- Separate MongoDB models per module
- Browser-only camera analysis for privacy
- Reusable auth and API service layer

---

## Folder Structure

```text
Interview-Analyzer/
  client/
    src/
      components/
        common/
      context/
        AuthContext.jsx
        InterviewContext.jsx
      hooks/
        useMediaPipe.js
        useSpeechRecognition.js
      pages/
        LandingPage.jsx
        DashboardPage.jsx
        InterviewSetupPage.jsx
        LiveInterviewPage.jsx
        ResultPage.jsx
        HistoryPage.jsx
        ResumeAnalyzerPage.jsx
        CodingInterviewPage.jsx
        AptitudePracticePage.jsx
        GroupDiscussionPage.jsx
        CommunicationTrainerPage.jsx
        HRRoundPracticePage.jsx
        ProfilePage.jsx
      services/
        api.js
        firebase.js
      utils/
        scoringEngine.js
        fillerWordDetector.js

  server/
    config/
      db.js
      firebase-admin.js
    middleware/
      authMiddleware.js
      errorHandler.js
    models/
      User.js
      InterviewSession.js
      ResumeAnalysis.js
      CodingSession.js
      CodingProgress.js
      AptitudeAttempt.js
      AptitudeMockTest.js
      GroupDiscussionSession.js
      CommunicationSession.js
      HRRoundSession.js
    prompts/
      interviewerPrompt.js
      resumePrompt.js
      codingPrompt.js
      aptitudePrompt.js
      groupDiscussionPrompt.js
      communicationPrompt.js
      hrRoundPrompt.js
    routes/
      auth.js
      user.js
      interview.js
      questions.js
      evaluation.js
      resume.js
      coding.js
      aptitude.js
      groupDiscussion.js
      communication.js
      hrRound.js
    services/
      geminiService.js
      resumeService.js
      codingService.js
      aptitudeService.js
      groupDiscussionService.js
      communicationService.js
      hrRoundService.js
    data/
      dsaRoadmap.js
      aptitudeCatalog.js
```

---

## Environment Variables

Create these files locally. Do not commit real keys.

### `client/.env`

```env
VITE_API_URL=/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### `server/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY="your_private_key_with_escaped_newlines"
```

You can also use `FIREBASE_SERVICE_ACCOUNT` as a full JSON string instead of separate Firebase Admin variables.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Interview-Analyzer.git
cd Interview-Analyzer
```

### 2. Install backend dependencies

```bash
cd server
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Install frontend dependencies

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

### 4. Build for production

```bash
cd client
npm run build
```

---

## API Routes

### Auth and User

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/verify` | Verify Firebase token and sync user |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |

### Interview Judger

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/interview/start` | Start interview session |
| PUT | `/api/interview/:id/end` | End and save interview |
| GET | `/api/interview/history` | Get interview history |
| GET | `/api/interview/:id` | Get one interview session |
| POST | `/api/questions/generate` | Generate dynamic question |
| POST | `/api/evaluation/answer` | Evaluate interview answer |

### Resume Analyzer

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/resume/analyze` | Upload and analyze PDF/DOCX resume |
| GET | `/api/resume/history` | Get resume analysis history |
| GET | `/api/resume/:id` | Get one resume report |

### Coding Interview

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/coding/sessions` | Start coding session |
| POST | `/api/coding/sessions/:id/hint` | Get AI hint |
| POST | `/api/coding/sessions/:id/submit` | Submit code for AI review |
| GET | `/api/coding/roadmap` | Get Top 200 DSA roadmap |
| PUT | `/api/coding/roadmap/:problemId` | Update problem status |
| GET | `/api/coding/daily-plan` | Get daily practice plan |

### Aptitude Practice

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/aptitude/catalog` | Get categories and topics |
| POST | `/api/aptitude/question` | Generate aptitude question |
| POST | `/api/aptitude/attempts` | Save practice attempt |
| GET | `/api/aptitude/analytics` | Get performance analytics |
| POST | `/api/aptitude/mock-tests/start` | Start mock test |
| POST | `/api/aptitude/mock-tests/:id/finish` | Finish mock test |

### Group Discussion

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/group-discussion/sessions` | Start GD session |
| POST | `/api/group-discussion/sessions/:id/turn` | Generate AI participant response |
| POST | `/api/group-discussion/sessions/:id/contribution` | Submit user contribution |
| POST | `/api/group-discussion/sessions/:id/end` | End GD and get score |
| GET | `/api/group-discussion/history` | Get GD history |

### Communication Trainer

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/communication/sessions` | Start communication session |
| POST | `/api/communication/sessions/:id/prompt` | Generate speaking prompt |
| POST | `/api/communication/sessions/:id/attempts` | Evaluate speaking attempt |
| POST | `/api/communication/sessions/:id/end` | End session |
| GET | `/api/communication/history` | Get communication history |

### HR Round Practice

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/hr-round/sessions` | Start HR round |
| POST | `/api/hr-round/sessions/:id/question` | Generate HR question |
| POST | `/api/hr-round/sessions/:id/answers` | Submit and evaluate answer |
| POST | `/api/hr-round/sessions/:id/end` | Finish HR round |
| GET | `/api/hr-round/history` | Get HR round history |

---

## Database Collections

| Collection | Purpose |
| --- | --- |
| `users` | Firebase user mapping and profile |
| `interviewsessions` | Interview questions, answers, scores, suggestions |
| `resumeanalyses` | Resume text, ATS scores, JD matching, suggestions |
| `codingsessions` | Coding questions, hints, submitted code, reviews |
| `codingprogresses` | Per-user DSA roadmap status |
| `aptitudeattempts` | Practice question attempts and timing |
| `aptitudemocktests` | Mock test attempts and topic-wise results |
| `groupdiscussionsessions` | GD turns, contribution analysis, final scores |
| `communicationsessions` | Speaking prompts, transcripts, fluency reports |
| `hrroundsessions` | HR questions, answers, STAR feedback, final readiness |
| `modules` | Optional module metadata for dashboard control |

---

## AI Prompt Modules

Each module keeps prompts separate from route logic.

| Prompt File | Used For |
| --- | --- |
| `interviewerPrompt.js` | Interview Judger questions and answer evaluation |
| `resumePrompt.js` | ATS feedback and resume improvement suggestions |
| `codingPrompt.js` | Coding questions, hints, and code reviews |
| `aptitudePrompt.js` | Aptitude question generation and explanations |
| `groupDiscussionPrompt.js` | GD simulation and scoring |
| `communicationPrompt.js` | Fluency, grammar, and speaking feedback |
| `hrRoundPrompt.js` | HR questions, STAR feedback, and readiness scoring |

---

## Privacy First Design

This project avoids storing raw video.

- Camera frames are analyzed in the browser using MediaPipe.
- Only numeric metrics are used for scoring.
- Speech transcript is stored only as text for interview history.
- Firebase Auth protects user data.
- MongoDB stores module history per authenticated user.

---

## Scoring Highlights

### Interview Judger

- Communication Score
- Confidence Score
- Body Language Score
- Technical Explanation Score
- HR Readiness Score
- Overall Interview Score

### Resume Analyzer ATS Weights

| Area | Marks |
| --- | ---: |
| Contact Info | 10 |
| Skills Match | 20 |
| Project Relevance | 20 |
| Experience / Internship | 15 |
| Education | 10 |
| Keywords | 15 |
| Grammar / Clarity | 10 |
| Total | 100 |

### HR Round Practice

- Relevance
- Structure
- Confidence
- Professionalism
- STAR Method
- Overall HR Readiness

---

## Deployment Plan

### Frontend

Deploy `client` on Vercel.

```text
Build Command: npm run build
Output Directory: dist
```

Set frontend environment variables in Vercel project settings.

### Backend

Deploy `server` on Render.

```text
Start Command: npm start
```

Set backend environment variables in Render dashboard.

---

## Project Roadmap

- [x] Firebase login and signup
- [x] MongoDB user sync
- [x] Dashboard with modular cards
- [x] Interview Judger
- [x] Resume Analyzer with ATS score
- [x] Coding Interview with DSA roadmap
- [x] Aptitude Practice with mock test mode
- [x] Group Discussion Judger
- [x] Communication Trainer
- [x] HR Round Practice
- [ ] Admin dashboard for module control
- [ ] Public shareable performance report
- [ ] PDF export for resume and interview feedback
- [ ] Email reminders for daily practice
- [ ] Code splitting and production performance polish

---

## Beginner Friendly Explanation

Think of this project as a coaching center inside one website.

- **Firebase** handles login.
- **React** shows the pages.
- **Express** receives requests from the frontend.
- **MongoDB** stores user progress.
- **Gemini** generates questions and feedback.
- **MediaPipe** checks camera-based body language in the browser.
- **Web Speech API** converts speech into text.

Every module follows the same pattern:

```text
Page -> API Service -> Express Route -> Module Service -> Gemini / MongoDB
```

That structure keeps the project easy to understand and easy to expand.

---

## Author

Built as a full-stack AI placement preparation platform for final year project, portfolio, and real student interview practice.

<div align="center">

**AI Career Coach Platform**  
Practice smarter. Improve faster. Walk into placements with confidence.

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:14b8a6,50:06b6d4,100:7c3aed&height=120&section=footer)

</div>
