import React from "react";
import { useState } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [form, setForm] = useState({
    dietaryPreference: "Vegetarian",
    cuisine: "South Indian",
    allergies: "",
    dislikedFoods: "",
    budgetPerDay: "250",
    mealsPerDay: "4"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function generatePlan(e) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch(`${API}/meal-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setError(err.message + " Make sure the backend and MySQL are running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <div className="badge">GEMINI-POWERED MEAL PLANNER</div>
        <h1>Your week, <span>well planned.</span></h1>
        <p>Build a practical 7-day meal plan around the foods you enjoy and the ingredients you avoid.</p>
      </header>

      <section className="panel">
        <div className="section-title"><div><small>STEP 01</small><h2>Your preferences</h2></div><span className="spark">✦</span></div>
        <form onSubmit={generatePlan}>
          <div className="grid">
            <label>Dietary preference
              <select name="dietaryPreference" value={form.dietaryPreference} onChange={update}>
                <option>Vegetarian</option><option>Non-vegetarian</option><option>Eggetarian</option><option>Vegan</option><option>Flexible</option>
              </select>
            </label>
            <label>Preferred cuisine
              <select name="cuisine" value={form.cuisine} onChange={update}>
                <option>South Indian</option><option>North Indian</option><option>Indian mixed</option><option>Mediterranean</option><option>East Asian</option><option>Any cuisine</option>
              </select>
            </label>
            <label>Meals per day
              <select name="mealsPerDay" value={form.mealsPerDay} onChange={update}>
                <option value="3">3 meals</option><option value="4">4 meals</option><option value="5">5 meals</option>
              </select>
            </label>
            <label>Approx. food budget per day (₹)
              <input name="budgetPerDay" type="number" min="0" max="10000" value={form.budgetPerDay} onChange={update} placeholder="e.g. 250" />
            </label>
            <label className="wide">Food allergies (comma separated)
              <input name="allergies" value={form.allergies} onChange={update} placeholder="e.g. peanuts, shellfish (write none if not applicable)" />
            </label>
            <label className="wide">Foods you dislike or want to avoid
              <input name="dislikedFoods" value={form.dislikedFoods} onChange={update} placeholder="e.g. bitter gourd, mushrooms" />
            </label>
          </div>
          <button className="generate" disabled={loading}>{loading ? <><span className="loader"></span> Creating your week...</> : "✦  Generate my 7-day plan"}</button>
        </form>
        {error && <div className="error">{error}</div>}
      </section>

      {result && <section className="results">
        <div className="result-head"><div><small>STEP 02 · YOUR PLAN</small><h2>{result.plan.title || "Your 7-day meal plan"}</h2></div><span className="saved">Saved to MySQL · #{result.id}</span></div>
        <p className="note">{result.plan.generalNote}</p>
        <div className="days">
          {result.plan.days.map((day, i) => <article className="day" key={day.day || i}>
            <h3><span>{String(i + 1).padStart(2, "0")}</span>{day.day}</h3>
            {day.meals?.map((meal, j) => <div className="meal" key={j}>
              <small>{meal.mealType}</small><h4>{meal.name}</h4>
              <p>{meal.description}</p>
              <div className="ingredients">{(meal.ingredients || []).join(" · ")}</div>
            </div>)}
          </article>)}
        </div>
        {result.plan.shoppingList?.length > 0 && <div className="shopping"><h3>Weekly shopping list</h3><div className="chips">{result.plan.shoppingList.map((item, i) => <span key={i}>{item}</span>)}</div></div>}
        <p className="disclaimer">General meal-planning suggestions only. Check ingredient labels and food-allergy cross-contact risks. For medical dietary needs, seek advice from a qualified healthcare professional.</p>
      </section>}
      <footer>Built with React · Express · Gemini · MySQL</footer>
    </main>
  );
}
