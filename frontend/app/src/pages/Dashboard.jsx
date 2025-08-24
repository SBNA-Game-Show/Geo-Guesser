import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
      {/* Animated Gradient Background */}
      <div
        className="absolute inset-0 z-0 animate-backgroundGradient"
        style={{
          background: "linear-gradient(270deg, #4f46e5, #9333ea, #ec4899, #f59e0b, #10b981)",
          backgroundSize: "1000% 1000%",
        }}
      />

      {/* Content Box */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 max-w-md w-full text-center animate-fadeInUp">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 select-none drop-shadow-lg">
          🌍 Welcome to GeoQuest
        </h1>
        <p className="text-gray-700 mb-10 text-lg">
          Ready to challenge your geography skills? Choose an option below.
        </p>

        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate("/start-game")}
            className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-800 hover:scale-105 transition-transform duration-300"
          >
            Start Game
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 hover:scale-105 transition-transform duration-300"
          >
            👤 View Profile
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="w-full py-4 text-xl font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg hover:from-yellow-600 hover:to-orange-600 hover:scale-105 transition-transform duration-300"
          >
            🏆 View Leaderboard
          </button>
        </div>

        <p className="mt-12 text-sm text-gray-300 select-none">
          © 2025 GeoQuest | Built for explorers 🌐
        </p>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes backgroundGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-backgroundGradient {
          animation: backgroundGradient 30s ease infinite;
        }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeInUp {
          animation: fadeInUp 1s ease forwards;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
