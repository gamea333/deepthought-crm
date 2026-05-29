# DeepThought — Growth Charter CRM

A fullstack web application that renders personalized Growth Charter documents 
from structured CRM node data. Built for the DeepThought Full-Stack Developer 
Internship assignment.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB installed locally OR a MongoDB Atlas free tier URI

### Step 1 — Clone the repo
```bash
git clone 
cd deepthought-crm
```

### Step 2 — Start MongoDB
```bash
# If running locally:
mongod
# MongoDB should be running on mongodb://localhost:27017
```

### Step 3 — Setup and start the backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
MONGODB_URI=mongodb://localhost:27017/deepthought-crm
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

Then start the backend:
```bash
node index.js
# You should see: "Server running on port 5000" and "MongoDB connected"
```

### Step 4 — Setup and start the frontend
```bash
# Open a new terminal
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 5 — Seed the sample data
- Open http://localhost:5173 in your browser
- Click **"Seed Sample Data"**
- You should see "Sureflow Formulations seeded successfully" in green
- Click **"View Growth Charter"** to see the rendered document

### Step 6 — Test Part B (Transcript Extraction)
- Click **"Extract from Transcript"**
- Click **"Load Sample Transcript"**
- Click **"Extract Nodes"** and wait 15–30 seconds
- Review the extracted node values
- Click **"Save and Generate Charter"**
- A new Growth Charter renders for Apex Precision Components

---