# CreativeForge AI - Deployment Guide

This document provides step-by-step instructions to deploy the CreativeForge AI project, which consists of a React frontend and a Flask backend.

---
##  Project Overview

| Layer     | Technology Stack |
|-----------|-----------------|
| Frontend  | React 18, Axios, CSS-in-JS |
| Backend   | Python 3.11, Flask, Flask-PyMongo, CORS |

- Frontend communicates with backend via REST API.
- Backend provides endpoints for creative compliance checks and health monitoring.

---

##  Backend Deployment (Render)

### Step 1: Create a Render Web Service
1. Sign up at [Render](https://render.com/) and connect your GitHub repository.
2. Click **New → Web Service**.

### Step 2: Service Settings

| Setting        | Value                               |
|----------------|-------------------------------------|
| Name           | creativeforge-ai                    |
| Environment    | Python 3                             |
| Branch         | main                                 |
| Root Directory | `/backend`                           |
| Build Command  | `pip install -r requirements.txt`    |
| Start Command  | `gunicorn app.main:app`              |

> **Important:** Ensure your Flask app entrypoint is `backend/app/main.py`.

### Step 3: Deploy & Verify
- Click **Create Web Service** to deploy.
- Verify backend health:  
  
  ```https://<your-backend-url>/health```
  
### Expected response:

``` {"status":"healthy","service":"CreativeForge AI"}```

---

#  Frontend Deployment Guide

This document explains how to deploy the React frontend for CreativeForge AI.

> Frontend communicates with backend via the `REACT_APP_API_URL` environment variable.

##  Deployment on Vercel

### Step 1: Setup Project
1. Sign up or log in at [Vercel](https://vercel.com/).
2. Connect your GitHub repository.
3. Import the `frontend` folder as the project root.

### Step 2: Environment Variables

| Key                  | Value                                     | Environment |
|----------------------|------------------------------------------ |-------------|
| REACT_APP_API_URL    | `https://creativeforge-ai.onrender.com/`  | Production  |

> This variable points the frontend to your deployed backend.

### Step 3: Build Settings

| Setting           | Command                          |
|-------------------|----------------------------------|
| Install Command   | `npm install --legacy-peer-deps` |
| Build Command     | `npm run build`                  |
| Output Directory  | `build`                          |

### Step 4: Deploy
- Push your changes to GitHub.
- Vercel automatically triggers a build and deploy.
- Frontend will be available at:  
  `https://creativeforge-ai.vercel.app/`

##  Local Development

### Step 1: Install dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```
### Step 2: Set environment variables 

### Create a .env file:

```REACT_APP_API_URL= https://creativeforge-ai.onrender.com/```

### Step 3: Run frontend locally
```npm start```

```Open browser:http://localhost:3000```

### Notes

Make sure backend is deployed and accessible before deploying frontend.

Frontend environment variable REACT_APP_API_URL must match the backend URL.

After deployment, the full app URL will point to the Vercel domain.

### `.env.example` (Frontend)

```bash
# Backend API URL
REACT_APP_API_URL=https://creativeforge-ai.onrender.com/
```
### Links:

Frontend Link : [Frontend](https://creativeforge-ai.vercel.app/)



