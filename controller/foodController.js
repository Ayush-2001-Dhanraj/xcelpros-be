const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const stringSimilarity = require("string-similarity");

const searchDishes = async (req, res) => {
  const { query } = req.query;

  if (!query || !query.trim()) {
    throw new CustomError.BadRequestError("Dish name is required.");
  }

  const { data } = await axios.get(`${process.env.USDA_BASE_URL}s/search`, {
    params: {
      api_key: process.env.USDA_API_KEY,
      query,
      pageSize: 20,
    },
  });

  const resultsWithScore = data.foods.map((item) => {
    const score = stringSimilarity.compareTwoStrings(
      query.toLowerCase(),
      item.description.toLowerCase()
    );
    return { ...item, score };
  });

  const sortedResults = resultsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const results = sortedResults.map((item) => ({
    name: item.description,
    brand: item.brandOwner || "Generic",
    fdcId: item.fdcId,
    score: item.score,
  }));

  res.status(StatusCodes.OK).json({ query, count: results.length, results });
};

const getCaloriesAndNutrients = async (req, res) => {
  const { fdcId, servings = 1 } = req.body;

  if (!fdcId) {
    throw new CustomError.BadRequestError("fdcId is required.");
  }

  const { data } = await axios.get(`${process.env.USDA_BASE_URL}/${fdcId}`, {
    params: { api_key: process.env.USDA_API_KEY },
  });

  const nutrients = data.foodNutrients || [];

  const calorieInfo = nutrients.find(
    (n) =>
      n.nutrient?.name.toLowerCase().includes("energy") &&
      n.nutrient?.unitName.toLowerCase() === "kcal"
  );

  const caloriesPerServing = calorieInfo ? calorieInfo.amount : 0;
  const totalCalories = caloriesPerServing * servings;

  const micronutrients = nutrients
    .filter(
      (n) =>
        n.nutrient?.name &&
        !n.nutrient.name.toLowerCase().includes("energy") &&
        ["mg", "µg", "g", "kcal"].includes(n.nutrient.unitName?.toLowerCase())
    )
    .map((n) => ({
      name: n.nutrient.name,
      amount: n.amount,
      unit: n.nutrient.unitName,
    }));

  res.status(StatusCodes.OK).json({
    dish_name: data.description,
    servings: Number(servings),
    calories_per_serving: caloriesPerServing,
    total_calories: totalCalories,
    micronutrients,
    source: "USDA FoodData Central",
    fdcId,
  });
};

module.exports = {
  searchDishes,
  getCaloriesAndNutrients,
};
