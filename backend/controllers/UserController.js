const User = require("../models/User");

const updateScore = async (req, res) => {
  const { score } = req.body;

  try {
    const user = await User.findById(req.user); // req.user is userId from JWT
    if (!user) return res.status(404).json({ message: "User not found" });

    user.score = score;
    await user.save();

    res.json({ message: "Score saved successfully", user: { name: user.name, score: user.score } });
  } catch (err) {
    res.status(500).json({ message: "Failed to update score", error: err.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ score: -1 }) // Highest scores first
      .limit(10)           // Top 10
      .select("name score"); // Only return name and score

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to get leaderboard", error: err.message });
  }
};

module.exports = {
  updateScore,
  getUserInfo,
  getLeaderboard, 
};
