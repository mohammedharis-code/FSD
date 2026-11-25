# AI Weekly Meal Planner

A beginner-friendly full-stack project using **React + Vite**, **Node.js + Express**, **Google Gemini API**, and **MySQL**.

## Features
- Collects food preferences, cuisine, allergies, disliked foods, budget, and meals per day.
- Uses Gemini to generate a varied 7-day meal plan as JSON.
- Saves the preferences and generated plan in MySQL.
- Displays the plan in a weekly grid.
- Includes a history endpoint for previously saved plans.
- Keeps the Gemini API key on the backend.

> This is an educational general meal-planning demo, not medical or dietetic advice. It does not calculate calories, prescribe weight-loss plans, or create therapeutic diets. Do not rely on it to determine whether a meal is safe for someone with a food allergy; always verify ingredients, labels, and cross-contact risks with a responsible adult/qualified professional. For medical dietary needs, consult a registered dietitian or healthcare professional.

## Requirements
- Node.js 20+
- MySQL 8+
- A Gemini API key from Google AI Studio
- npm

Official Gemini SDK documentation: https://googleapis.github.io/js-genai/
Gemini API generation guide: https://ai.google.dev/api/generate-content

## 1. Database setup
Open MySQL Workbench or the MySQL command line and run:

```sql
SOURCE /full/path/to/ai-weekly-meal-planner/database/schema.sql;
```

Or open `database/schema.sql` in Workbench and execute it.

## 2. Backend setup
Open a terminal:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and edit the values:

```env
PORT=5000
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.8-flash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_meal_planner
```

Use a model name currently available to your Google AI Studio project if the example model is not available to your account. Never commit `.env` or share your API key.

Start backend:

```bash
npm run dev
```

Backend health check: http://localhost:5000/api/health

## 3. Frontend setup
Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (normally http://localhost:5173).

## How it works
1. React sends preferences to `POST /api/meal-plans`.
2. Express validates the fields.
3. The backend asks Gemini for JSON containing 7 days and the requested meals.
4. The backend parses the JSON and saves preferences plus plan JSON to MySQL.
5. React renders the returned plan.

## API endpoints
- `GET /api/health` — server status.
- `POST /api/meal-plans` — generate and save a weekly plan.
- `GET /api/meal-plans` — list recent saved plans.
- `GET /api/meal-plans/:id` — retrieve one saved plan.

## Troubleshooting
- **Gemini key missing:** check `backend/.env`; restart the backend after editing it.
- **Gemini model not found:** change `GEMINI_MODEL` to a model enabled for your API key in AI Studio.
- **MySQL connection refused:** make sure MySQL Server is running and the host/port are correct.
- **Access denied:** check `DB_USER` and `DB_PASSWORD`.
- **CORS/network error:** run frontend on Vite's default port and backend on port 5000.
- **JSON parse error:** Gemini may have returned a non-JSON response; the backend will report an error. Try again or choose an available model.

## Suggested improvements for a college project
- Add login and user accounts (bcrypt + sessions/JWT).
- Add edit/delete plan functionality.
- Add a curated nutrition database rather than asking an LLM to invent nutrient values.
- Add server-side rate limiting and request size limits before deployment.
- Deploy backend with HTTPS and store secrets in your hosting provider's secret manager.
