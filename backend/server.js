import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { createWeeklyPlan } from "./gemini.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "30kb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ status: "error", database: "not connected" });
  }
});

app.post("/api/meal-plans", async (req, res) => {
  try {
    const {
      dietaryPreference, cuisine, allergies = "",
      dislikedFoods = "", budgetPerDay = null, mealsPerDay = 3
    } = req.body;

    if (!dietaryPreference || !cuisine) {
      return res.status(400).json({ error: "Dietary preference and cuisine are required." });
    }
    const mealCount = Number(mealsPerDay);
    if (!Number.isInteger(mealCount) || mealCount < 3 || mealCount > 5) {
      return res.status(400).json({ error: "Meals per day must be between 3 and 5." });
    }
    const budget = budgetPerDay === "" || budgetPerDay === null ? null : Number(budgetPerDay);
    if (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget > 10000)) {
      return res.status(400).json({ error: "Enter a valid daily budget." });
    }

    const preferences = {
      dietaryPreference: String(dietaryPreference).slice(0, 40),
      cuisine: String(cuisine).slice(0, 80),
      allergies: String(allergies).slice(0, 500),
      dislikedFoods: String(dislikedFoods).slice(0, 500),
      budgetPerDay: budget,
      mealsPerDay: mealCount
    };

    const plan = await createWeeklyPlan(preferences);
    const [result] = await pool.execute(
      `INSERT INTO meal_plans
       (dietary_preference, cuisine, allergies, disliked_foods, budget_per_day, meals_per_day, plan_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        preferences.dietaryPreference, preferences.cuisine,
        preferences.allergies, preferences.dislikedFoods,
        preferences.budgetPerDay, preferences.mealsPerDay,
        JSON.stringify(plan)
      ]
    );

    res.status(201).json({ id: result.insertId, preferences, plan });
  } catch (error) {
    console.error("Meal plan error:", error.message);
    res.status(500).json({ error: error.message || "Unable to generate the meal plan." });
  }
});

app.get("/api/meal-plans", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, dietary_preference AS dietaryPreference, cuisine, created_at AS createdAt
       FROM meal_plans ORDER BY id DESC LIMIT 20`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Could not load saved plans." });
  }
});

app.get("/api/meal-plans/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM meal_plans WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Plan not found." });
    const row = rows[0];
    res.json({
      id: row.id,
      preferences: {
        dietaryPreference: row.dietary_preference,
        cuisine: row.cuisine,
        allergies: row.allergies,
        dislikedFoods: row.disliked_foods,
        budgetPerDay: row.budget_per_day,
        mealsPerDay: row.meals_per_day
      },
      plan: typeof row.plan_json === "string" ? JSON.parse(row.plan_json) : row.plan_json
    });
  } catch {
    res.status(500).json({ error: "Could not load this plan." });
  }
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
