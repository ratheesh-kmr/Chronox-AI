const express = require("express");
const router = express.Router();
const {
    authMiddleware,
} = require("../middleware/authMiddleware");
const { getLabel, createLabel, updateLabel, deleteAllLabel, deleteLabel } = require("../controllers/labelController");

router.use(authMiddleware);

router.route("/").get(getLabel).post(createLabel).delete(deleteAllLabel);

router.route("/:id").put(updateLabel).delete(deleteLabel);

module.exports = router;