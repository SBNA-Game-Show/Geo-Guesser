import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SignupPage from "./pages/SignupPage";
import StartGame from "./pages/startGame";
import Leaderboard from "./pages/Leaderboard";

 function App() {
  return (
    

      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/start-game" element={<StartGame />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

        </Routes>
      </Router>
   
  );
}

export default App;