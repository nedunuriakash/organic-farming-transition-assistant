# Organic Buddy Documentation

Welcome to **Organic Buddy**, a comprehensive platform designed to help farmers transition from chemical-intensive agriculture to sustainable organic practices.

## Deployment Architecture
- **Backend**: Hosted on **Render** (Flask + MongoDB Atlas).
- **Frontend**: Hosted on **Vercel** (React + Lucide-React).

## Deployment Configuration

### 1. Backend (Render)
Ensure the following environment variables are set in your Render Dashboard:
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `GEMINI_API_KEY`: Your Google Gemini API Key.

**Installation:**
```bash
pip install -r requirements.txt
```

**Run Command:**
```bash
python app.py
```

---

### 2. Frontend (Vercel)
Ensure the following environment variables are set in your Vercel Dashboard:
- `REACT_APP_BACKEND_URL`: The URL of your Render backend (e.g., `https://your-backend.onrender.com`).

**Installation:**
```bash
npm install
```

**Build Command:**
```bash
npm run build
```

---

## Core Features
1. **Impact Scanner**: Research-backed human toxicity audit for 20+ common chemicals.
2. **Organic Recommender**: AI-powered discovery of safe bio-alternatives.
3. **Transition Roadmap**: Step-by-step 7-day preparation tasks for each organic switch.
4. **ROI Calculator**: Long-term financial forecasting for organic conversion.

## Tech Stack
- **AI**: Google Gemini (Large Language Model)
- **Database**: MongoDB (Atlas)
- **Visualization**: Recharts (Radar/Area Charts)
- **Icons**: Lucide React
