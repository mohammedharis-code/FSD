import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export async function createWeeklyPlan(preferences) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to backend/.env.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a general meal-planning assistant for an educational demo.
Create a varied, practical 7-day meal plan based on the preferences below.

USER PREFERENCES:
${JSON.stringify(preferences, null, 2)}

RULES:
- Respect the stated dietary pattern and excluded/disliked foods.
- Treat listed allergies as strict exclusions. Do not suggest those ingredients.
- Do not claim that any meal is guaranteed allergen-safe; cross-contact and packaged ingredients must be checked separately.
- Use familiar, affordable foods where possible and respect the stated approximate daily budget.
- Do not calculate or invent calories, macros, medical benefits, or precise nutrient values.
- Do not prescribe weight loss, weight gain, fasting, supplements, or therapeutic diets.
- If the user describes a medical condition or asks for a medical diet, do not prescribe one; return a brief note to consult a registered dietitian/healthcare professional.
- Provide a short description and ingredient list for each meal.
- Return exactly 7 days (Monday through Sunday) and exactly the requested number of meals per day.
- Return valid JSON only, matching this structure:
{
  "title": "Your 7-day meal plan",
  "generalNote": "Short general note",
  "days": [
    {
      "day": "Monday",
      "meals": [
        {
          "mealType": "Breakfast",
          "name": "Meal name",
          "description": "Short description",
          "ingredients": ["ingredient 1", "ingredient 2"]
        }
      ]
    }
  ],
  "shoppingList": ["ingredient 1", "ingredient 2"]
}
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 7000
    }
  });

  const raw = response.text;
  if (!raw) throw new Error("Gemini returned an empty response.");
  const plan = JSON.parse(raw);

  if (!Array.isArray(plan.days) || plan.days.length !== 7) {
    throw new Error("Gemini did not return a complete 7-day plan. Please try again.");
  }
  return plan;
}
