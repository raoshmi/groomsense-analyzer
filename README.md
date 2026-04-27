# 🚀 GroomSense Analyzer

**GroomSense Analyzer** is an advanced, GenAI-powered grooming analysis tool built with Next.js, Firebase Auth, and the Gemini Vision API (`gemini-2.5-flash`). It uses a Multi-Agent AI architecture to provide users with personalized, real-time insights on their skin, hair, and overall style.

## 🔗 Live Links
- **Live Website**: [https://groomsense-analyzer.vercel.app](https://groomsense-analyzer.vercel.app)
- **Vercel Dashboard**: [https://vercel.com/raoshmis-projects/groomsense-analyzer](https://vercel.com/raoshmis-projects/groomsense-analyzer)

## ✨ Advanced Features
- **Multi-Agent GenAI**: Simultaneously processes images as a Dermatologist, Stylist, and Fashion Consultant.
- **Firebase Authentication**: Secure Google OAuth login.
- **Multimodal Input**: Supports both File Upload and Live Webcam capture.
- **Progress Tracking**: Visual line charts tracking grooming scores over time.
- **Premium UI/UX**: Dark mode, 3D glassmorphism, floating micro-animations.

## 🛠️ Built With
- **Frontend**: Next.js (App Router), React, Recharts, Framer Motion
- **Backend API**: Next.js Serverless Route Handlers
- **Database & Auth**: Firebase Suite (Authentication, Firestore, Storage)
- **AI Engine**: Google Gemini Vision API

## 🚀 Getting Started Locally

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your configuration keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
