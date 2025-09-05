const express = require("express");
const router = express.Router();

const {
  getHolidays,
  createHolidays,
  deleteAllHolidays,
  updateHolidays,
  deleteHolidays,
} = require("../controllers/holidayController");

const { authMiddleware } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(getHolidays)
  .post(createHolidays)
  .delete(deleteAllHolidays);
router
  .route("/:id")
  .put(authMiddleware, updateHolidays)
  .delete(authMiddleware, deleteHolidays);

module.exports = router;
