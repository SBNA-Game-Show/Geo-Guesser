import API from "../api";
import { useNavigate } from "react-router-dom"; // ✅ Add navigation hook
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
    Circle,
  CircleMarker,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import categories from "../data/landmarksData";


const guessClickSound = "/sounds/click.mp3";
const submitSound = "/sounds/confirm.mp3";
const roundSound = "/sounds/next-round.mp3";
const gameOverSound = "/sounds/game-over.mp3";
const playSound = (file) => {
  const audio = new Audio(file);
  audio.play().catch((err) => console.warn("Audio play failed:", err));
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MAX_ROUNDS = 5;
const TIMER_SECONDS = 30;

const countryAreas = {
  /* your countryAreas unchanged */
};

const normalizeCountryName = (name) => {
  /* your normalizeCountryName unchanged */
};

const StartGame = () => {
  const streetViewRef = useRef(null);
const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [guess, setGuess] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [distance, setDistance] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timedOut, setTimedOut] = useState(false);

  // New state for showing animated score badge after guess
  const [showScoreBadge, setShowScoreBadge] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const fetchLocation = () => {
    const allLandmarks = categories.flatMap((cat) => cat.landmarks);
    const random = allLandmarks[Math.floor(Math.random() * allLandmarks.length)];
    setLocation({
      ...random,
      latitude: random.coordinates.latitude,
      longitude: random.coordinates.longitude,
    });
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    if (location && window.google && streetViewRef.current) {
      setTimeout(() => {
        new window.google.maps.StreetViewPanorama(streetViewRef.current, {
          position: {
            lat: location.latitude,
            lng: location.longitude,
          },
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          disableDefaultUI: false,
        });
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    if (!gameOver && location) {
      setTimer(TIMER_SECONDS);
      setTimedOut(false);
    }
  }, [rounds.length, location]);

  useEffect(() => {
    if (gameOver || timedOut || distance) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setTimedOut(true);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, timedOut, distance]);

  const haversineDistance = (loc1, loc2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLon = toRad(loc2.lng - loc1.lng);
    const lat1 = toRad(loc1.lat);
    const lat2 = toRad(loc2.lat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateScore = (distanceKm, countryName) => {
    const normalizedName = normalizeCountryName(countryName);
    const area = countryAreas[normalizedName];

    if (!area) {
      if (distanceKm < 1) return 1000;
      if (distanceKm < 10) return 1000 - distanceKm * 50;
      if (distanceKm < 100) return 500 - (distanceKm - 10) * 5;
      if (distanceKm < 1000) return 100 - (distanceKm - 100) * 0.1;
      return 0;
    }

    const maxDistance = Math.sqrt(area);

    const score = Math.max(0, 1000 * (1 - distanceKm / maxDistance));

    return Math.round(score);
  };
const handleSubmitGuess = async () => {
  if (!guess || !location) return alert("Please place your guess on the map!");

  const d = haversineDistance(
    { lat: location.latitude, lng: location.longitude },
    guess
  );
/*  const score = Math.round(calculateScore(d, location.country) * 100) / 100;

  const newRound = { location, guess, distance: d, score };
  const updatedRounds = [...rounds, newRound];
*/

const score = Math.round(calculateScore(d, location.country) * 100) / 100;

// ✅ calculate accuracy percentage (relative closeness)
const normalizedName = normalizeCountryName(location.country);
const area = countryAreas[normalizedName];
const maxDistance = area ? Math.sqrt(area) : 1000;
const accuracy = Math.max(0, 100 - (d / maxDistance) * 100).toFixed(1);

// ✅ bonus breakdown
let bonus = 0;
if (d < 1) bonus = 200;
else if (d < 10) bonus = 100;

// ✅ save in round object with accuracy + bonus
const newRound = { location, guess, distance: d, score, accuracy, bonus };
const updatedRounds = [...rounds, newRound];

  setRounds(updatedRounds);
  setDistance(d.toFixed(2));
  setShowMap(false);
  setConfirming(false);

  setLastScore(score);
  setShowScoreBadge(true);


  // Hide the score badge after 3 seconds
  setTimeout(() => {
    setShowScoreBadge(false);
  }, 3000);

if (updatedRounds.length === MAX_ROUNDS) {
  const totalScore = updatedRounds.reduce((sum, r) => sum + r.score, 0);

  try {
    await API.put("/user/score", { score: totalScore });
    console.log("Score and name saved to MongoDB");
  } catch (err) {
    console.error("Failed to save score", err.response?.data || err.message);
  }

  playSound(gameOverSound); // 🔊 play game over sound
  setGameOver(true);
}
else {
    playSound(submitSound


    ); // 🔊 play round end sound
  }
};

  const handlePlayAgain = () => {
    fetchLocation();
    setGuess(null);
    setDistance(null);
    setShowMap(false);
    setConfirming(false);
    setRounds([]);
    setGameOver(false);
    setTimedOut(false);
    setTimer(TIMER_SECONDS);
    setShowScoreBadge(false);
  };

const GuessMap = () => {
  useMapEvents({
    click(e) {
      setGuess(e.latlng);
      setConfirming(true);
      playSound(guessClickSound); // 🔊 guess click sound
    },
  });
  return null;
};

  const latestRound = rounds[rounds.length - 1];

  return (
    <div className="h-screen w-screen bg-gray-200 relative overflow-hidden select-none">

  {/* ✅ Navigation Bar */}
{/* ✅ Professional & Interactive Navigation Bar */}
<nav className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-3 backdrop-blur-lg bg-black/50 shadow-lg rounded-b-2xl">
  {/* Logo / Brand */}
  <div className="font-extrabold text-2xl tracking-wide select-none cursor-default text-white relative group">
    GeoQuest
    {/* subtle hover underline animation */}
    <span className="absolute left-0 -bottom-1 w-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-300 group-hover:w-full rounded-full"></span>
  </div>
<div className="flex gap-4">
  {/* Dashboard Button */}
  <button
    onClick={() => navigate("/dashboard")}
    className="relative px-6 py-2 font-semibold rounded-lg text-white bg-gray-800 shadow-lg
      hover:scale-105 hover:shadow-2xl transform transition-all duration-300
      before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500
      before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-30"
  >
    Dashboard
  </button>

  {/* Restart Button */}
  <button
    onClick={handlePlayAgain}
    className="relative px-6 py-2 font-semibold rounded-lg text-white bg-gray-800 shadow-lg
      hover:scale-105 hover:shadow-2xl transform transition-all duration-300
      before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500
      before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-30"
  >
    Restart
  </button>

  {/* Exit Button */}
  <button
    onClick={() => navigate("/dashboard")}
    className="relative px-6 py-2 font-semibold rounded-lg text-white bg-red-700 shadow-lg
      hover:scale-105 hover:shadow-2xl transform transition-all duration-300
      before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-pink-500 before:via-red-500 before:to-yellow-500
      before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-35"
  >
    Exit
  </button>
</div>


</nav>

      {/* Google Street View */}
      <div ref={streetViewRef} className="absolute top-0 left-0 h-full w-full z-0" />

      {/* Background image container with blur, dim, scale when guessing */}
      <div
        className={`absolute top-0 left-0 w-full h-full z-10 transition-all duration-700 ease-in-out
          ${showMap ? "scale-95" : "scale-100"}`}
        style={{
          filter: showMap ? "brightness(0.5)" : "brightness(1)",
          backdropFilter: showMap ? "blur(6px)" : "blur(0px)",
          transitionProperty: "transform, filter, backdrop-filter",
          pointerEvents: showMap ? "none" : "auto",
        }}
      >
        {location?.imageUrl && (
          <img
            src={location.imageUrl}
            alt="landmark"
            className="w-full h-full object-cover"
          />
        )}
<div className="absolute top-20 left-4 bg-white bg-opacity-80 p-2 rounded shadow z-20 pointer-events-none">
  <p className="text-xs text-center text-gray-800 italic">{location?.hint}</p>
</div>

      </div>

      {/* Clickable transparent overlay to cancel guess mode if user clicks outside mini map */}
      {showMap && (
        <div
          className="absolute inset-0 z-15"
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(6px)",
            cursor: "pointer",
          }}
          onClick={() => setShowMap(false)}
        />
      )}

      {/* Timer */}
      {!distance && !gameOver && !timedOut && (
        <div
          className={`absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-5 py-2 rounded z-30 text-lg font-bold flex items-center space-x-2
          ${timer <= 5 ? "animate-pulse border-2 border-red-500" : ""}`}
        >
          ⏳ Time Left: <span className="ml-2">{timer}s</span>
        </div>
      )}

      {/* Guess Location Button */}
      {!showMap && !distance && !gameOver && (
        <button
    onClick={() => {
      playSound(guessClickSound); // 🔊 play sound on click
      setShowMap(true);
    }}
    className="absolute top-20 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700 transition"
  >
    Guess Location
  </button>
      )}

      {/* Mini Map with smooth enlarge */}
      {showMap && (
        <div
          className="absolute bottom-4 right-4 rounded bg-white overflow-visible z-20
          transition-all duration-500 ease-out shadow-[0_0_15px_5px_rgba(192,192,192,0.7)]"
          style={{ width: 500, height: 350, transformOrigin: "bottom right" }}
        >
          <div className="relative w-full h-full">
            <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <GuessMap />
              {guess && (
                <Marker position={guess} icon={markerIcon}>
                  <Popup>Your Guess</Popup>
                </Marker>
              )}
            </MapContainer>
            {confirming && (
              <div className="absolute -top-12 left-0 w-full px-1">
                <button
                  onClick={handleSubmitGuess}
                  className="w-full bg-green-600 text-white py-2 font-bold rounded shadow hover:bg-green-700 transition"
                >
                  Submit Guess?
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* After guess, show result with lines and markers */}
      {distance && !gameOver && latestRound && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white text-xl z-30 p-4">
          <h2 className="text-2xl font-bold mb-2">
            Round {rounds.length} of {MAX_ROUNDS}
          </h2>
          <p>
            You were {distance} km away from{" "}
            <strong>
              {location.city}, {location.country}
            </strong>
            !
          </p>

          {/* Animated Score Badge */}
          {showScoreBadge && (
            <div
              className="mt-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600
              text-white font-bold text-4xl px-8 py-3 rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.7)]
              animate-bounceFade select-none max-w-xs text-center"
            >
    Score = {Math.round(lastScore)} points!
            </div>
          )}

          <div className="w-[90%] h-[400px] mt-4 rounded overflow-hidden shadow-lg">
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[location.latitude, location.longitude]} icon={markerIcon}>
                <Popup>Actual Location</Popup>
              </Marker>
              <Marker position={[guess.lat, guess.lng]} icon={markerIcon}>
                <Popup>Your Guess</Popup>
              </Marker>
              <Polyline
                positions={[
                  [location.latitude, location.longitude],
                  [guess.lat, guess.lng],
                ]}
                color="red"
              />
            </MapContainer>
          </div>
          {!gameOver && (
            <button
              onClick={() => {
                setGuess(null);
                setDistance(null);
                fetchLocation();
                playSound(roundSound);
              }}
              className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Next Round
            </button>
          )}
        </div>
      )}

  {/* Game Over Screen */}
{gameOver && (
  <div
 
    className="absolute top-[64px] left-0 right-0 bottom-0 flex flex-col items-center justify-start z-40 p-8 overflow-y-auto"
    style={{
      background: "rgba(255, 255, 255, 0.15)",
      backdropFilter: "blur(15px) saturate(180%)",
      WebkitBackdropFilter: "blur(15px) saturate(180%)",
      animation: "fadeInUp 1s ease forwards",
    }}
  >
    {/* Animated subtle moving background pattern */}
    <div
      className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30 animate-slowPan"
      style={{ filter: "brightness(0.6) contrast(1.2) saturate(1.3)" }}
    />

    <h1 className="text-5xl font-extrabold mb-6 text-white drop-shadow-lg text-center">
      {timedOut ? "⏰ Time's Up!" : "🎉 Game Over!"}
    </h1>
    <p className="text-2xl mb-8 text-white/90 font-semibold text-center drop-shadow-md">
      {timedOut ? "You ran out of time!" : "Your Final Scores:"}
    </p>

    {/* Wrap round summary + map overview in a flex container */}
    {!timedOut && (
      <div className="flex flex-row gap-4 w-full max-w-5xl h-[90vh]">
        
        {/* Round Summary (unchanged) */}
        <div className="flex-1 bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex flex-col border border-white/20">
          <h2 className="text-2xl font-extrabold text-center text-yellow-300 drop-shadow-md mb-3">
            🏆 Round Breakdown
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {rounds.map((r, index) => (
              <div
                key={index}
                className="bg-black/40 p-3 rounded-xl shadow-inner hover:scale-[1.01] transition transform duration-200"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-white">
                    🔹 Round {index + 1}
                  </span>
                  <span className="text-base font-extrabold text-green-400">
                    {Math.round(r.score)} pts
                  </span>
                </div>

                <div className="w-full bg-white/20 rounded-full h-2 mb-1 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${r.accuracy}%`,
                      background:
                        r.accuracy > 80
                          ? "linear-gradient(90deg, #34d399, #10b981)"
                          : r.accuracy > 50
                          ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                          : "linear-gradient(90deg, #f87171, #ef4444)",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-200">
                  🎯 {r.accuracy}% | 🎁{" "}
                  <span
                    className={`font-semibold ${
                      r.bonus > 0 ? "text-pink-400" : "text-gray-400"
                    }`}
                  >
                    +{r.bonus}
                  </span>
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 p-3 rounded-xl shadow-lg text-center">
            <p className="text-base font-semibold text-white">Final Score</p>
            <p className="text-2xl font-extrabold text-yellow-300 drop-shadow-lg">
              {Math.round(rounds.reduce((sum, r) => sum + r.score + r.bonus, 0))} pts
            </p>
            <p className="mt-1 text-xs text-white/80">
              Avg Accuracy:{" "}
              <span className="font-bold text-white">
                {(
                  rounds.reduce((sum, r) => sum + parseFloat(r.accuracy), 0) /
                  rounds.length
                ).toFixed(1)}
                %
              </span>
            </p>
          </div>
        </div>

     {/* Map Overview */}
<div className="flex-1 p-2 rounded-xl shadow-lg bg-black/20 relative">
  {/* Title */}
  <h3 className="text-white font-bold mb-2 text-center z-40 relative">
    Map Overview
  </h3>

  {/* Legend (on top of the map) */}
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
    <div className="bg-black/80 p-3 rounded-xl shadow-lg text-white font-bold flex gap-6 items-center animate-pulse">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 bg-green-500 rounded-full inline-block animate-bounce" />
        Actual Location
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 bg-red-500 rounded-full inline-block animate-bounce" />
        Your Guess
      </div>
    </div>
  </div>

  <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {rounds.map((r, idx) => (
      <div key={idx}>
        <Circle
          center={[r.location.latitude, r.location.longitude]}
          radius={150000}
          pathOptions={{ color: "#10b981", fillColor: "#10b981", fillOpacity: 0.5, weight: 3 }}
        />
        <Circle
          center={[r.guess.lat, r.guess.lng]}
          radius={120000}
          pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.5, weight: 3 }}
        />
        <Polyline
          positions={[[r.location.latitude, r.location.longitude], [r.guess.lat, r.guess.lng]]}
          color="#f87171"
          weight={4}
          opacity={0.8}
        />
      </div>
    ))}
  </MapContainer>
</div>



      </div>
    )}

    {/* Play Again Button */}
<div className="mt-4 flex justify-center w-full">
  <button
    onClick={handlePlayAgain}
    className="px-8 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-full text-white font-bold text-lg shadow-xl hover:scale-105 transform transition-all duration-300"
  >
    Play Again
  </button>
</div>

  </div>
)}


<style>{`
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slowPan {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .animate-slowPan {
    animation: slowPan 30s linear infinite;
  }
`}</style>

    </div>
  );
};

export default StartGame;