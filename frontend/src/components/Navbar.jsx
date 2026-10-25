import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="logo">
        <span className="logo-icon">🌱</span>
        <span>CropSense</span>
      </Link>

      {/* NAVIGATION */}
      <div className="nav-links">
        <Link
          to="/"
          className={isActive("/") ? "active" : ""}
        >
          Home
        </Link>

        <Link
          to="/soil-prediction"
          className={isActive("/soil-prediction") ? "active" : ""}
        >
          Soil Prediction
        </Link>

        <Link
          to="/weather"
          className={isActive("/weather") ? "active" : ""}
        >
          Weather Dashboard
        </Link>

        <Link
          to="/page4"
          className={isActive("/page4") ? "active" : ""}
        >
          Part 4
        </Link>

        <Link
          to="/page5"
          className={isActive("/page5") ? "active" : ""}
        >
          Part 5
        </Link>
      </div>

      {/* ACTION BUTTON */}
      <Link to="/soil-prediction" className="nav-button">
        Start Prediction →
      </Link>
    </nav>
  );
}

export default Navbar;