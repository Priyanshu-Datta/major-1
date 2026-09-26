import { Link, useLocation } from "react-router-dom";

function Navbar() {

  const location = useLocation();

  return (
    <nav className="navbar">

      {/* LOGO */}

      <Link
        to="/"
        className="logo"
      >
        <span className="logo-icon">
          🌱
        </span>

        <span>
          CropSense
        </span>
      </Link>


      {/* NAVIGATION */}

      <div className="nav-links">

        <Link
          to="/"
          className={
            location.pathname === "/"
              ? "active"
              : ""
          }
        >
          Home
        </Link>


        <Link
          to="/soil-prediction"
          className={
            location.pathname === "/soil-prediction"
              ? "active"
              : ""
          }
        >
          Soil Prediction
        </Link>


        <Link
          to="/page3"
          className={
            location.pathname === "/page3"
              ? "active"
              : ""
          }
        >
          Part 3
        </Link>


        <Link
          to="/page4"
          className={
            location.pathname === "/page4"
              ? "active"
              : ""
          }
        >
          Part 4
        </Link>


        <Link
          to="/page5"
          className={
            location.pathname === "/page5"
              ? "active"
              : ""
          }
        >
          Part 5
        </Link>

      </div>


      {/* PREDICTION BUTTON */}

      <Link
        to="/soil-prediction"
        className="nav-button"
      >
        Start Prediction →
      </Link>

    </nav>
  );
}

export default Navbar;