const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authentication");
const {
  searchDishes,
  getCaloriesAndNutrients,
} = require("../controller/foodController");

router.route("/search").get(authenticateUser, searchDishes);
router.route("/get-calories").post(authenticateUser, getCaloriesAndNutrients);

module.exports = router;
