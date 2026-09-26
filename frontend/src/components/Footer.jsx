import { Link } from "react-router-dom";

function Footer() {

  return (
    <footer className="footer">

      <div className="footer-content">

        {/* BRAND */}

        <div className="footer-brand">

          <Link
            to="/"
            className="footer-logo"
          >
            🌱 CropSense
          </Link>

          <p>
            A smart agriculture platform powered
            by Machine Learning.
          </p>

        </div>


        {/* NAVIGATION */}

        <div className="footer-column">

          <h4>
            Navigation
          </h4>

          <Link to="/">
            Home
          </Link>

          <Link to="/soil-prediction">
            Soil Prediction
          </Link>

          <Link to="/page3">
            Part 3
          </Link>

          <Link to="/page4">
            Part 4
          </Link>

          <Link to="/page5">
            Part 5
          </Link>

        </div>


        {/* TECHNOLOGY */}

        <div className="footer-column">

          <h4>
            Technology
          </h4>

          <span>
            React.js
          </span>

          <span>
            Python
          </span>

          <span>
            Flask
          </span>

          <span>
            Random Forest
          </span>

          <span>
            Scikit-learn
          </span>

        </div>

      </div>


      <div className="footer-bottom">

        © 2026 CropSense — Smart Agriculture
        Machine Learning Platform

      </div>

    </footer>
  );
}

export default Footer;