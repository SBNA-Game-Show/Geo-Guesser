import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center px-6 py-16">
      <div className="bg-white bg-opacity-90 shadow-2xl rounded-3xl p-10 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 select-none">
          🌍 Welcome to GeoQuest
        </h1>
        <p className="text-gray-700 mb-10 text-lg">
          Ready to challenge your geography skills? Choose an option below.
        </p>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate("/start-game")}
            className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-800 transition"
          >
            Start Game
          </button>

          <button
            className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition"
          >
            👤 View Profile
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg hover:from-yellow-600 hover:to-orange-600 transition"
          >
            🏆 View Leaderboard
          </button>
        </div>

        <p className="mt-12 text-sm text-gray-300 select-none">
          © 2025 GeoQuest | Built for explorers 🌐
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
