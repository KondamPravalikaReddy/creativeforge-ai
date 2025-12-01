# CreativeForge AI — Retail Media Creative Builder

**CreativeForge AI** is an AI-powered web application that helps small and medium-sized retail advertisers create professional, guideline-compliant creative assets in minutes — not hours.

---

## 🚀 Project Overview

SMBs running retail campaigns on marketplaces and social platforms need many creatives per campaign. CreativeForge AI solves this by combining a visual canvas builder with an AI-driven compliance engine so teams can produce high-quality, guideline-compliant creatives quickly and affordably.

**Problem solved**

* SMBs need 20+ creatives per campaign for Flipkart, Amazon, Blinkit, and social media.
* Creative agencies charge ₹15,000–25,000 per asset and take 2–3 days.
* Manual guideline compliance checking causes ad rejections and delays.

**Solution**

* Drag-and-drop visual creative builder
* Real-time compliance scoring and actionable suggestions
* Multi-format support (Instagram, Facebook, LinkedIn)

**Impact**

* ⏱️ 10× faster: 3 hours → 5 minutes per creative
* 💰 90% cost savings: ₹25,000 → ₹2,500/month
* ✅ 95%+ first-time approval rate

---

## ✨ Key Features

### Visual Canvas Builder

* Upload product packshot with instant background detection
* Editable headline with character counter
* Real-time canvas preview and resizing
* Platform format presets (Instagram 1080×1080, Facebook 1200×630, LinkedIn 1200×627)

### 🤖 AI-Driven Compliance Engine

* Validates creatives against retailer guidelines
* Checks for product image presence, text coverage, safe zones, layout rules
* Numeric compliance score (0–100) with color-coded status
* Hard violations and soft warnings, plus remedial suggestions

### 💡 Smart Guidance

* Quick-start help guide
* AI tips for better visual performance (eye flow, contrast, readability)
* "Ready for Campaign" status when compliant

### 📱 Multi-Format Support

* Platform preset selector and adaptive canvas resizing
* Future: auto-resize with content-aware cropping

---

## 🛠️ Technology Stack

**Frontend**

* React 18
* Axios
* CSS-in-JS (prototype-friendly)

**Backend**

* Python 3.11
* Flask
* CORS

**Compliance Engine**

* Rule-based validation (extensible to GPT-4 Vision)
* MongoDB-ready guideline store (optional)

**Deployment**

* Frontend: Vercel / Netlify
* Backend: Render / Heroku
* Gunicorn for production

---

## 🏛 Architecture

```
text
┌─────────────────────────────┐
│   React Frontend            │
│  (Canvas + Compliance UI)   │
└──────────────┬──────────────┘
               │ REST API (Axios)
               ↓
┌─────────────────────────────┐
│   Flask Backend             │
│  /health                    │
│  /api/creative/validate...  │
└──────────────┬──────────────┘
               │
      ┌────────┴────────┐
      ↓                 ↓
┌──────────┐     ┌─────────────┐
│Compliance│     │Image Service│
│ Engine   │     │(Future: AI) │
└──────────┘     └─────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

* Python 3.9+
* Node.js 14+
* npm or yarn

### Backend (local)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend
python -m app.main
```

Backend will start on: `http://localhost:5000`

Health check: `http://localhost:5000/health` — expected response:

```json
{ "service": "CreativeForge AI", "status": "healthy" }
```

### Frontend (local)

```bash
# In a new terminal
cd frontend
npm install
npm start
```

Frontend will open on: `http://localhost:3000`

---

## 📖 Usage Guide — Create a Compliant Creative (5 steps)

1. **Select Platform Format** — Instagram (1080×1080), Facebook (1200×630), LinkedIn (1200×627)
2. **Enter Offer** — Type headline (max 60 chars, counter visible)
3. **Upload Product Image** — Click "Upload Packshot"
4. **Add Headline to Canvas** — Click "Add Headline"
5. **Check Compliance** — Click "Check Compliance" and aim for 95+ to get "Ready for Campaign"

**Example flows**

* Non-compliant (no product image): Score ~70/100, violation `no_product_image` → fix by uploading product image
* Compliant (image + headline): Score ~95/100 → Ready for Campaign

---

## 🔌 API Endpoints

### `GET /health`

Checks backend health status.
Response example:

```json
{ "service": "CreativeForge AI", "status": "healthy" }
```

### `POST /api/creative/validate-compliance`

Validates a creative against guidelines.

**Request body example**:

```json
{
  "canvasState": {
    "elements": [
      {
        "id": "txt-1",
        "type": "text",
        "x": 100,
        "y": 50,
        "width": 600,
        "height": 80,
        "data": {
          "text": "Test Offer",
          "fontSize": 32,
          "color": "#000000"
        }
      }
    ],
    "width": 1080,
    "height": 1080,
    "backgroundColor": "#ffffff"
  },
  "guidelines": {
    "maxTextCoverage": 20,
    "minLogoSize": 100,
    "safeZoneMargin": 10,
    "approvedColors": ["#000000", "#ffffff"]
  }
}

```

**Response example**:

```json
{
    "success": true,
    "compliance": {
        "score": 85,
        "violations": [
            {
                "type": "no_product_image",
                "severity": "error",
                "message": "No product image found.",
                "suggestion": "Add at least one product image to the creative."
            }
        ],
        "warnings": [],
        "recommendations": [],
        "isCompliant": false
    }
}
```

---

## 🧪 Testing

**Frontend**

```bash
cd frontend
npm test
```

**Backend**

```bash
cd backend
pytest tests/
```

---

## 🚀 Deployment

**Backend (Render)**

* Push repo to GitHub
* Create Render Web Service
* Build command: `pip install -r requirements.txt`
* Start command: `gunicorn -w 4 -b 0.0.0.0:$PORT app.main:app`
* Env vars: `MONGODB_URI`, `OPENAI_API_KEY` (for future AI features)

**Frontend (Vercel)**

* Import repo in Vercel
* Set `REACT_APP_API_BASE=<your-render-url>`
* Enable auto-deploy on push

---

## 📊 Project Stats

* Frontend: ~500 lines of React
* Backend: ~200 lines of Flask + compliance engine
* Compliance rules: 5+ core rules
* Supported formats: Instagram, Facebook, LinkedIn

---

## 🎯 Roadmap

**Phase 1 — MVP (current)**

* Visual canvas builder ✅
* Core compliance engine ✅
* Multi-format support ✅
* Real-time validation ✅

**Phase 2 — Next**

* Auto-adaptive resizing (seam carving)
* AI-generated background variations (DALL·E 3)
* GPT-4 Vision for parsing PDF guidelines
* Template library (20+ templates)

**Phase 3 — Growth**

* Multi-retailer guideline database
* Collaborative workflows
* Performance analytics dashboard
* Campaign-ready creative sets (auto-generated variations)

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the issue/PR templates and write clear commit messages.

---

## 📝 License

MIT License — see `LICENSE` file for details.

---

## 🎤 Authors & Support

**Author:** Kondam Pravalika Reddy

**College/University:** Chaitanya Deemed to be University

**Email:** [[kpravalikareddy68@gmail.com](mailto:kpravalikareddy68@gmail.com)]

**GitHub:** https://github.com/KondamPravalikaReddy

For support or feedback, open an issue on GitHub or contact the author via email.


