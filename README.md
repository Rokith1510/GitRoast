# 🔥 GitRoast & Rescue

> **"Give a messy GitHub profile the honest feedback it deserves."**  
> Product philosophy: *"Roast the profile, not the person."* Every criticism MUST have a corresponding solution.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Deployable-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/run)
[![Tests](https://img.shields.io/badge/Tests-32%20Passing-success)](https://nodejs.org/api/test.html)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-10b981)](#accessibility)

GitRoast & Rescue is a production-grade web application engineered for the GitHub Roast and Rescue challenge. Rather than generating generic analytics charts, it analyzes **real public GitHub profiles** using the official GitHub REST API, calculates a **transparent 100-point GitHub Health Score**, delivers a **hilariously honest, personalized roast** targeting detected engineering weaknesses, and provides an **actionable, prioritized Rescue Plan** with an estimated potential score.

---

## ⚡ The Core Experience

```
GitHub username
      │
      ▼
Fetch real GitHub profile & repositories
      │
      ▼
Identify actual weaknesses & calculate 100-pt Health Score
      │
      ▼
Generate personalized Roast (3–5 witty zingers based on detected flaws)
      │
      ▼
Generate actionable Rescue Plan & "Top 5 Fixes"
      │
      ▼
Estimate Potential Score & Audit Key Repositories
      │
      ▼
Optional "Recruiter Mode" for objective hiring manager evaluation
```

---

## 🎯 Scoring System (Deterministic 100-Point Model)

Scores are computed deterministically from real GitHub data across 5 core categories:

| Category | Max Points | What It Measures |
| :--- | :---: | :--- |
| **Documentation** | **25** | Profile README (`<user>/<user>`), repo README coverage, setup depth & guides |
| **Project Quality** | **25** | Repo descriptions, live demo/homepage URLs, originality vs. forks, topics & licenses |
| **Activity** | **20** | Commit/push recency (30d, 90d, 180d), active repos in past year, zombie repo hygiene |
| **Professional Presence**| **15** | Profile bio, personal website/portfolio link, location, avatar legitimacy, community |
| **Technical Diversity** | **15** | Number of distinct languages, stack balance, non-trivial codebases (>100KB) |
| **Total** | **100** | **Transparent overall score with itemized point deduction explanations** |

### Potential Score Recovery
- **Current Score**: Calculated deterministically from current profile signals.
- **Potential Score**: Exact score achievable if all detected weaknesses are resolved.
- **Potential Improvement**: Mathematically derived from the sum of recoverable deduction points (e.g. `Current: 63` ➔ `Potential: 81` = `+18 pts`).

---

## 🔥 Roast Engine

Generates 3–5 personalized observations based on *actual detected problems*:
- **Missing README**: *"Your repositories have documentation allergies."*
- **Missing descriptions**: *"Your projects are apparently classified government secrets."*
- **Inactive repositories**: *"Your GitHub isn't a portfolio. It's a digital graveyard."*
- **No live demos**: *"You built the projects but forgot to build the front door."*
- **Fork hoarding**: *"You don't write repositories; you adopt them like Pokémon cards."*
- **Questionable repo names**: *"Git naming convention: whatever my keyboard hits first."*

---

## 🚑 Rescue Engine

*"Every criticism MUST have a corresponding solution."*

For each detected weakness, GitRoast provides:
1. **Problem**: Short, clear issue statement.
2. **Why it matters**: Practical explanation from the recruiter or open-source peer perspective.
3. **Action to take**: Concrete step-by-step resolution.
4. **Priority**: High 🔴, Medium 🟡, Low 🔵.
5. **Estimated Score Improvement**: Exact recoverable points (e.g. `+6 pts`).
6. **"Your Top 5 Fixes"**: An interactive, prioritized checklist of the fastest, highest-leverage actions.

---

## 💼 Recruiter Mode

A toggleable, humor-free professional assessment designed for career development and hiring screens:
- **Job Readiness Status**: Evaluated into actionable tiers (e.g., *Interview Ready*, *Approaching Readiness*).
- **5 Technical Dimensions**: Technical Breadth, Project Quality, Documentation, Activity, and Professional Presence.
- **Tactical Career Recommendations**: Recruiter-grade guidance to maximize resume screening conversion.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (Zero frontend frameworks, sub-100ms load)
- **External API**: GitHub REST API (v3)
- **AI Enhancement**: Optional OpenAI API with automatic rule-based fallback
- **Containerization**: Docker (multi-stage Alpine image)
- **Cloud Deployment**: Google Cloud Run (automatic port binding to `0.0.0.0:$PORT`)
- **Test Framework**: Native Node.js Test Runner (`node:test`, `node:assert`)

---

## 📁 Project Structure

```
gitroast/
├── public/
│   ├── index.html         # Semantic, accessible dark developer interface
│   ├── styles.css         # Polished dark theme, high-contrast WCAG 2.1 AA
│   └── app.js             # Vanilla JS app logic, XSS-safe DOM rendering
├── src/
│   ├── server.js          # Cloud Run compatible Express server
│   ├── routes/
│   │   └── api.js         # API routes (/api/roast, /api/health, /api/rate-limit)
│   ├── services/
│   │   ├── github.js      # GitHub API service, error handling & token support
│   │   └── ai.js          # Optional OpenAI client with instant fallback
│   ├── analysis/
│   │   ├── scorer.js      # 100-pt deterministic health scorer
│   │   ├── roaster.js     # Roast engine with personalized observations
│   │   ├── rescuer.js     # Rescue engine, top 5 fixes & score recovery
│   │   ├── repoAnalyzer.js# Per-repository health score, roast & rescue
│   │   └── recruiter.js   # Recruiter mode candidate audit
│   └── utils/
│       ├── validator.js   # GitHub username validation & XSS sanitization
│       └── cache.js       # In-memory TTL cache to eliminate redundant calls
├── tests/
│   ├── usernameValidation.test.js
│   ├── scorer.test.js
│   ├── missingReadme.test.js
│   ├── missingDescription.test.js
│   ├── activityAnalysis.test.js
│   ├── roastGeneration.test.js
│   ├── rescueGeneration.test.js
│   ├── repositoryAnalysis.test.js
│   ├── apiIntegration.test.js
│   └── realProfileE2E.js
├── Dockerfile             # Hardened multi-stage Docker build for Cloud Run
├── .dockerignore
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/gitroast.git
cd gitroast
npm install
```

### 2. Configure Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```

Edit `.env` (optional):
```env
PORT=8080

# Optional: Raise rate limits from 60 to 5,000 req/hr
# GITHUB_TOKEN=ghp_yourPersonalAccessTokenHere

# Optional: OpenAI API for natural language roasts (rule-based fallback runs automatically)
# OPENAI_API_KEY=sk-yourKeyHere
```

### 3. Run Locally
```bash
# Start in production mode
npm start

# Or run with live file reloading
npm run dev
```

Open your browser to: `http://localhost:8080`

---

## 🧪 Testing

GitRoast includes a comprehensive test suite covering all scoring rules, defect detectors, roasters, and API endpoints:

```bash
npm test
```

### Test Coverage Highlights:
- **`usernameValidation.test.js`**: Validates edge cases, invalid characters, leading `@`, and 39-character boundaries.
- **`scorer.test.js`**: Verifies 100-point ceiling, category caps, and mathematical potential score recovery.
- **`missingReadme.test.js`**: Tests profile and repository README penalty calculations.
- **`missingDescription.test.js`**: Tests repository description audit.
- **`activityAnalysis.test.js`**: Validates commit streak, inactivity thresholds, and zombie repository detection.
- **`roastGeneration.test.js`**: Ensures compliance with "Roast the profile, not the person".
- **`rescueGeneration.test.js`**: Ensures every single criticism maps to a prioritized, actionable solution.
- **`repositoryAnalysis.test.js`**: Tests repository scoring, repo-specific roasts, and relative date formatting.
- **`apiIntegration.test.js`**: Tests `/api/health`, `/api/rate-limit`, and error handling middleware.

---

## ☁️ Google Cloud Run Deployment

GitRoast is built from the ground up for seamless deployment to **Google Cloud Run**.

### Option A: Direct Deployment via Google Cloud CLI (`gcloud`)

1. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Deploy directly from source:**
   ```bash
   gcloud run deploy gitroast \
     --source . \
     --region us-central1 \
     --platform managed \
     --allow-unauthenticated \
     --set-env-vars="PORT=8080,CACHE_TTL_SECONDS=900"
   ```

3. **(Optional) Add GitHub Token for 5,000 req/hr limit:**
   ```bash
   gcloud run services update gitroast \
     --region us-central1 \
     --set-env-vars="GITHUB_TOKEN=your_token_here"
   ```

---

### Option B: Build and Push Docker Image to Google Artifact Registry

1. **Build the container image:**
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/gitroast:latest .
   ```

2. **Test container locally:**
   ```bash
   docker run -p 8080:8080 -e PORT=8080 gcr.io/YOUR_PROJECT_ID/gitroast:latest
   ```
   Open `http://localhost:8080` to verify container operation.

3. **Push to Google Container / Artifact Registry:**
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/gitroast:latest
   ```

4. **Deploy the container to Cloud Run:**
   ```bash
   gcloud run deploy gitroast \
     --image gcr.io/YOUR_PROJECT_ID/gitroast:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080
   ```

---

## 🔒 Security & Accessibility

### Security Standards
- **Zero API Keys in Frontend**: All GitHub and OpenAI interactions occur strictly server-side.
- **Strict Input Validation**: Usernames sanitized against official GitHub RFC format.
- **Safe DOM Rendering**: Sanitized text insertion via `textContent` and safe builders to prevent XSS.
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`.
- **No Stack Traces**: Raw server errors are hidden in production; friendly error codes returned.

### Accessibility Standards
- **WCAG 2.1 AA Compliant**: High contrast ratios on dark backgrounds.
- **Keyboard Navigation**: Interactive elements support Tab, Enter, and Space keys with visible focus rings.
- **Screen Reader Support**: Semantic HTML (`<main>`, `<header>`, `<article>`, `<section>`), ARIA labels (`aria-live`, `aria-expanded`, `role="tab"`).
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`.

---

## 📄 License

MIT License — Built with pride for the GitHub Roast and Rescue Hackathon Challenge.
