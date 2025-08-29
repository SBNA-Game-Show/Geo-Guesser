const express = require("express");
const router = express.Router();
const { updateScore, getUserInfo } = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");
const { getLeaderboard } = require("../controllers/UserController");

router.put("/score", authMiddleware, updateScore);
router.get("/me", authMiddleware, getUserInfo);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
