import { Link } from "react-router-dom";

function Home() {

  return (
    <div className="home-page">

      {/* HERO */}

      <section className="home-hero">

        <div className="home-hero-content">

          <div className="hero-badge">
            🌱 SMART AGRICULTURE
          </div>

          <h1>
            Intelligent
            <br />

            <span>
              Agriculture
            </span>

            <br />

            Through Data.
          </h1>

          <p>
            CropSense is a Machine Learning based
            agriculture platform designed to provide
            intelligent insights for modern farming.
          </p>


          <div className="hero-buttons">

            <Link
              to="/soil-prediction"
              className="primary-button"
            >
              Try Soil Prediction →
            </Link>

            <Link
              to="/page3"
              className="secondary-button"
            >
              Explore Project
            </Link>

          </div>

        </div>


        {/* VISUAL */}

        <div className="home-visual">

          <div className="main-plant">
            🌱
          </div>


          <div className="floating-card floating-one">

            <span>
              🌾
            </span>

            <div>

              <small>
                Crop
              </small>

              <strong>
                Smart Farming
              </strong>

            </div>

          </div>


          <div className="floating-card floating-two">

            <span>
              🤖
            </span>

            <div>

              <small>
                Technology
              </small>

              <strong>
                Machine Learning
              </strong>

            </div>

          </div>


          <div className="floating-card floating-three">

            <span>
              🌍
            </span>

            <div>

              <small>
                Goal
              </small>

              <strong>
                Better Agriculture
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* PROJECT INTRODUCTION */}

      <section className="intro-section">

        <div className="section-label">
          OUR PROJECT
        </div>

        <h2>
          Technology designed for
          smarter agricultural decisions.
        </h2>

        <p>
          Our project combines Machine Learning
          and modern web technologies to create
          an intelligent agricultural platform.
          Different modules of the platform focus
          on different aspects of agriculture.
        </p>

      </section>


      {/* CURRENT MODULE */}

      <section className="module-section">

        <div className="module-heading">

          <div>

            <div className="section-label">
              CURRENT MODULE
            </div>

            <h2>
              Soil Prediction
            </h2>

          </div>

          <Link
            to="/soil-prediction"
            className="text-button"
          >
            Open Module →
          </Link>

        </div>


        <div className="module-card">

          <div className="module-icon">
            🌱
          </div>

          <div>

            <h3>
              Crop Soil & Nutrient Prediction
            </h3>

            <p>
              Enter a crop name and temperature.
              The trained Random Forest models
              predict the suitable soil type,
              humidity, moisture, nitrogen,
              potassium and phosphorus.
            </p>

          </div>

        </div>

      </section>


      {/* FUTURE MODULES */}

      <section className="future-section">

        <div className="section-label">
          PROJECT MODULES
        </div>

        <h2>
          More modules are coming.
        </h2>

        <p>
          The platform will contain multiple
          agriculture-focused modules. The remaining
          modules will be added as the project
          development progresses.
        </p>


        <div className="future-grid">

          <div>
            <span>
              03
            </span>

            <h3>
              Project Module
            </h3>

            <p>
              Coming soon
            </p>
          </div>


          <div>
            <span>
              04
            </span>

            <h3>
              Project Module
            </h3>

            <p>
              Coming soon
            </p>
          </div>


          <div>
            <span>
              05
            </span>

            <h3>
              Project Module
            </h3>

            <p>
              Coming soon
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;