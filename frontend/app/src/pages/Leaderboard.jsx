import { useEffect, useState } from "react";
import API from "../api";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // send JWT if needed
        const res = await API.get("/user/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8 animate-fadeIn">
      <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-5xl w-full border border-white/20">
        <h2 className="text-5xl font-extrabold text-center text-white mb-10 select-none animate-textGradient bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h2>

        {loading ? (
          <p className="text-center text-white/80 text-xl animate-pulse">Loading leaderboard...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-xl">
            <table className="min-w-full border-collapse border border-white/30">
              <thead className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-700 text-white select-none">
                <tr>
                  <th className="py-4 px-8 text-left font-semibold border-r border-white/40 tracking-wide">
                    Rank
                  </th>
                  <th className="py-4 px-8 text-left font-semibold border-r border-white/40 tracking-wide">
                    Name
                  </th>
                  <th className="py-4 px-8 text-left font-semibold tracking-wide">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr
                      key={user._id || index}
                      className={`transition transform hover:scale-105 hover:bg-white/20 cursor-pointer ${
                        index % 2 === 0 ? "bg-white/10" : "bg-white/5"
                      }`}
                    >
                      <td className="py-4 px-8 border-r border-white/20 font-bold text-yellow-300">
                        <span className={`inline-block px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-8 border-r border-white/20 font-semibold text-white/90">
                        {user.name}
                      </td>
                      <td className="py-4 px-8 font-bold text-white/90 animate-pulse">
                        {user.score}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-white/50 italic select-none">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .animate-textGradient {
          background-size: 200% 200%;
          animation: gradientShift 4s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
