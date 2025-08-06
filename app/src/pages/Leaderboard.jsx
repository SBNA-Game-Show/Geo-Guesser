import { useEffect, useState } from "react";
import API from "../api";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get("/user/leaderboard");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard", err.response?.data || err.message);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="bg-white bg-opacity-90 shadow-2xl rounded-3xl p-10 max-w-4xl w-full">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-10 select-none">
          🏆 Leaderboard
        </h2>

        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white select-none">
              <tr>
                <th className="py-4 px-8 text-left font-semibold border-r border-indigo-400 tracking-wide">
                  Rank
                </th>
                <th className="py-4 px-8 text-left font-semibold border-r border-indigo-400 tracking-wide">
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
                    className={`transition cursor-default ${
                      index % 2 === 0 ? "bg-white" : "bg-indigo-50"
                    } hover:bg-purple-100`}
                  >
                    <td className="py-4 px-8 border-r border-indigo-300 font-semibold text-indigo-800">
                      #{index + 1}
                    </td>
                    <td className="py-4 px-8 border-r border-indigo-300 text-indigo-900 font-medium">
                      {user.name}
                    </td>
                    <td className="py-4 px-8 font-bold text-indigo-900">
                      {user.score}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-indigo-400 italic select-none">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
