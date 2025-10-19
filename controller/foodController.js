const axios = require("axios");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { getBestMatch } = require("../utils/fuzzyMatch");

const searchDishes = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new CustomError.BadRequestError("Dish name is required.");
  }

  const { data } = await axios.get(process.env.USDA_BASE_URL, {
    params: {
      api_key: process.env.USDA_API_KEY,
      query,
      pageSize: 10,
    },
  });

  if (!data.foods || data.foods.length === 0) {
    throw new CustomError.NotFoundError(`No dishes found for: ${query}`);
  }

  const results = data.foods.map((item) => ({
    name: item.description,
    brand: item.brandOwner || "Generic",
    fdcId: item.fdcId,
  }));

  res.status(StatusCodes.OK).json({ query, count: results.length, results });
};

const getCaloriesAndNutrients = async (req, res) => {
  const { dish_name, servings = 1 } = req.body;

  if (!dish_name) {
    throw new CustomError.BadRequestError("Dish name is required.");
  }

  const { data } = await axios.get(process.env.USDA_BASE_URL, {
    params: {
      api_key: process.env.USDA_API_KEY,
      query: dish_name,
      pageSize: 10,
    },
  });

  const foods = data.foods || [];
  if (foods.length === 0) {
    throw new CustomError.NotFoundError(`No data found for ${dish_name}`);
  }

  const bestMatch = getBestMatch(dish_name, foods);
  const nutrients = bestMatch.foodNutrients || [];
  const calorieInfo = nutrients.find(
    (n) =>
      n.nutrientName.toLowerCase().includes("energy") && n.unitName === "KCAL"
  );
  const caloriesPerServing = calorieInfo ? calorieInfo.value : 0;
  const totalCalories = caloriesPerServing * servings;

  const micronutrients = nutrients
    .filter(
      (n) =>
        !n.nutrientName.toLowerCase().includes("energy") &&
        ["MG", "UG", "G", "KCAL"].includes(n.unitName)
    )
    .map((n) => ({
      name: n.nutrientName,
      amount: n.value,
      unit: n.unitName,
    }));

  res.status(StatusCodes.OK).json({
    dish_name: bestMatch.description,
    servings: Number(servings),
    calories_per_serving: caloriesPerServing,
    total_calories: totalCalories,
    micronutrients,
    source: "USDA FoodData Central",
  });
};

module.exports = {
  searchDishes,
  getCaloriesAndNutrients,
};
