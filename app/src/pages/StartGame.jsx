import API from "../api";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import categories from "../data/landmarksData";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MAX_ROUNDS = 5;
const TIMER_SECONDS = 30;

// Country areas in square kilometers (expanded with your JSON countries)
const countryAreas = {
  "France": 551695,
  "United States": 9833520,
  "USA": 9833520,
  "Italy": 301340,
  "Brazil": 8515767,
  "Cambodia": 181035,
  "Chile": 756102,
  "Germany": 357022,
  "Singapore": 719,
  "Turkey": 783356,
  "Nepal": 147516,
  "Canada": 9984670,
  "Zambia": 752618,
  "Zimbabwe": 390757,
  "Zambia/Zimbabwe": 1143375, // combined
  "Vietnam": 331212,
  "Argentina": 2780400,
  "Argentina/Brazil": 11296167, // combined
  "Australia": 7692024,
  "Japan": 377975,
  "Bolivia": 1098581,
  "China": 9596961,
  "United Kingdom": 242495,
  "UK": 242495,
  "Spain": 505990,
  "UAE": 83600,
};

// Normalize country names to a standard key (helps with matching)
const normalizeCountryName = (name) => {
  const mapping = {
    "USA": "United States",
    "United States of America": "United States",
    "UK": "United Kingdom",
    "Zambia/Zimbabwe": "Zambia/Zimbabwe",
    "Argentina/Brazil": "Argentina/Brazil",
    // add more aliases if needed
  };
  return mapping[name] || name;
};

const StartGame = () => {
  const streetViewRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [guess, setGuess] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [distance, setDistance] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [rounds, setRounds] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timedOut, setTimedOut] = useState(false);

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

  // Calculate score relative to country size
  const calculateScore = (distanceKm, countryName) => {
    const normalizedName = normalizeCountryName(countryName);
    const area = countryAreas[normalizedName];

    // If no area data, fallback to original flat scoring
    if (!area) {
      if (distanceKm < 1) return 1000;
      if (distanceKm < 10) return 1000 - distanceKm * 50;
      if (distanceKm < 100) return 500 - (distanceKm - 10) * 5;
      if (distanceKm < 1000) return 100 - (distanceKm - 100) * 0.1;
      return 0;
    }

    // Normalize distance relative to country size (sqrt of area is approx linear dimension in km)
    const maxDistance = Math.sqrt(area); // rough country size dimension

    // Score decreases linearly from 1000 (perfect) to 0 (worst)
    // If guess distance >= maxDistance, score = 0
    const score = Math.max(0, 1000 * (1 - distanceKm / maxDistance));

    return Math.round(score);
  };

  const handleSubmitGuess = async () => {
    if (!guess || !location) return alert("Please place your guess on the map!");

    const d = haversineDistance(
      { lat: location.latitude, lng: location.longitude },
      guess
    );
    const score = calculateScore(d, location.country);

    const newRound = { location, guess, distance: d, score };
    const updatedRounds = [...rounds, newRound];

    setRounds(updatedRounds);
    setDistance(d.toFixed(2));
    setShowMap(false);
    setConfirming(false);

    if (updatedRounds.length === MAX_ROUNDS) {
      const totalScore = updatedRounds.reduce((sum, r) => sum + r.score, 0);

      try {
        await API.put("/user/score", { score: totalScore });
        console.log("Score and name saved to MongoDB");
      } catch (err) {
        console.error("Failed to save score", err.response?.data || err.message);
      }

      setGameOver(true);
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
  };

  const GuessMap = () => {
    useMapEvents({
      click(e) {
        setGuess(e.latlng);
        setConfirming(true);
      },
    });
    return null;
  };

  const latestRound = rounds[rounds.length - 1];

  return (
    <div className="h-screen w-screen bg-gray-200 relative overflow-hidden">
      {/* Google Street View */}
      <div ref={streetViewRef} className="absolute top-0 left-0 h-full w-full z-0" />

      {/* Fullscreen Image + Hint Overlay */}
      {location?.imageUrl && (
        <div className="absolute top-0 left-0 w-full h-full z-10">
          <img
            src={location.imageUrl}
            alt="landmark"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-2 rounded shadow z-20">
            <p className="text-xs text-center text-gray-800 italic">{location.hint}</p>
          </div>
        </div>
      )}

      {/* Timer */}
      {!distance && !gameOver && !timedOut && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded z-30 text-lg font-bold">
          ⏳ Time Left: {timer}s
        </div>
      )}

      {!showMap && !distance && !gameOver && (
        <button
          onClick={() => setShowMap(true)}
          className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 text-white rounded shadow-lg hover:bg-blue-700"
        >
          Guess Location
        </button>
      )}

      {showMap && (
        <div className="absolute bottom-4 right-4 w-[300px] h-[200px] z-20 shadow-lg bg-white rounded overflow-visible">
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
                  className="w-full bg-green-600 text-white py-2 font-bold rounded shadow hover:bg-green-700"
                >
                  Submit Guess?
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {distance && !gameOver && latestRound && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white text-xl z-30 p-4">
          <h2 className="text-2xl font-bold mb-2">
            Round {rounds.length} of {MAX_ROUNDS}
          </h2>
          <p>
            You were {distance} km away from{" "}
            <strong>{location.city}, {location.country}</strong>! Score: {latestRound.score}
          </p>
          <div className="w-[90%] h-[400px] mt-4 rounded overflow-hidden shadow-lg">
            <MapContainer center={[location.latitude, location.longitude]} zoom={2} style={{ height: "100%", width: "100%" }}>
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
              }}
              className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Next Round
            </button>
          )}
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white z-40 p-4">
          <h1 className="text-3xl font-bold mb-4">
            {timedOut ? "⏰ Time's Up!" : "Game Over!"}
          </h1>
          <p className="text-lg mb-2">
            {timedOut
              ? "You ran out of time!"
              : `Total Score: ${rounds.reduce((sum, r) => sum + r.score, 0)}`}
          </p>
          <button
            onClick={handlePlayAgain}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default StartGame;
