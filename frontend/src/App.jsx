import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import SoilPrediction from "./pages/SoilPrediction";
import WeatherDashboard from "./pages/WeatherDashboard";
import DiseaseDetection from "./pages/diseasedetection";
import Page5 from "./pages/Page5";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          {/* PAGE 1 - HOME */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* PAGE 2 - SOIL PREDICTION */}
          <Route
            path="/soil-prediction"
            element={<SoilPrediction />}
          />

          {/* PAGE 3 - WEATHER DASHBOARD */}
          <Route
            path="/weather"
            element={<WeatherDashboard />}
          />

          {/* PAGE 4 */}
          <Route
            path="/Page4"
            element={<DiseaseDetection />}
          />

          {/* PAGE 5 */}
          <Route
            path="/page5"
            element={<Page5 />}
          />

          {/* REDIRECT OLD URL*/}
          <Route
            path="/Page4"
            element={<Navigate to="/page4" replace />}
          />
          <Route
            path="/page3"
            element={<Navigate to="/weather" replace />}
          />

          {/* REDIRECT UNKNOWN URLS TO HOME */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;