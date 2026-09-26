import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import SoilPrediction from "./pages/SoilPrediction";
import Page3 from "./pages/Page3";
import Page4 from "./pages/Page4";
import Page5 from "./pages/Page5";

function App() {
  return (
    <div className="app">

      <Navbar />

      <main>

        <Routes>

          {/* PAGE 1 */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* PAGE 2 - CURRENT ML MODULE */}
          <Route
            path="/soil-prediction"
            element={<SoilPrediction />}
          />

          {/* FUTURE PROJECT PARTS */}
          <Route
            path="/page3"
            element={<Page3 />}
          />

          <Route
            path="/page4"
            element={<Page4 />}
          />

          <Route
            path="/page5"
            element={<Page5 />}
          />

        </Routes>

      </main>

      <Footer />

    </div>
  );
}

export default App;