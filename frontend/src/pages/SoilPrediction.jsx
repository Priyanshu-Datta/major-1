import { useEffect, useState } from "react";

function SoilPrediction() {

  const [crops, setCrops] = useState([]);

  const [crop, setCrop] = useState("");

  const [temperature, setTemperature] =
    useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =================================
  // LOAD CROPS FROM FLASK
  // =================================

  useEffect(() => {

    fetch(
      "https://major-1-1.onrender.com/crops"
    )

      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Backend connection failed."
          );
        }

        return response.json();

      })

      .then((data) => {

        setCrops(data.crops);

        if (data.crops.length > 0) {
          setCrop(data.crops[0]);
        }

      })

      .catch((err) => {

        setError(
          "Cannot connect to ML backend. " +
          "Make sure Flask is running."
        );

        console.error(err);

      });

  }, []);


  // =================================
  // PREDICTION
  // =================================

  const handlePredict = async (event) => {

    event.preventDefault();

    setError("");
    setResult(null);


    if (!crop) {

      setError(
        "Please select a crop."
      );

      return;
    }


    if (temperature === "") {

      setError(
        "Please enter temperature."
      );

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:5000/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            crop: crop,

            temperature:
              Number(temperature)

          })

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "Prediction failed."
        );

      }


      setResult(data);

    }

    catch (error) {

      setError(
        error.message
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="soil-prediction-page">

      {/* PAGE HEADER */}

      <section className="page-heading">

        <div className="section-label">
          MACHINE LEARNING MODULE
        </div>

        <h1>
          Soil Prediction
        </h1>

        <p>
          Enter the crop name and temperature
          to predict suitable soil and important
          environmental and nutrient requirements.
        </p>

      </section>


      {/* MAIN CONTENT */}

      <section className="prediction-container">

        {/* INPUT CARD */}

        <div className="prediction-input-card">

          <div className="card-icon">
            🌾
          </div>

          <h2>
            Enter Crop Details
          </h2>

          <p>
            Provide the required information
            for prediction.
          </p>


          <form
            onSubmit={handlePredict}
          >

            {/* CROP */}

            <label>
              Crop Name
            </label>

            <select
              value={crop}
              onChange={(event) =>
                setCrop(event.target.value)
              }
            >

              {crops.length === 0 && (

                <option>
                  Loading crops...
                </option>

              )}


              {crops.map((item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              ))}

            </select>


            {/* TEMPERATURE */}

            <label>
              Temperature
            </label>

            <div className="unit-input">

              <input
                type="number"
                step="0.1"
                placeholder="Enter temperature"
                value={temperature}
                onChange={(event) =>
                  setTemperature(
                    event.target.value
                  )
                }
              />

              <span>
                °C
              </span>

            </div>


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
            >

              {loading
                ? "Predicting..."
                : "Predict Requirements →"
              }

            </button>

          </form>


          {/* ERROR */}

          {error && (

            <div className="error-box">

              ⚠️ {error}

            </div>

          )}

        </div>


        {/* RESULT CARD */}

        <div className="prediction-result-card">

          {!result && !loading && (

            <div className="result-placeholder">

              <div className="placeholder-icon">
                🌱
              </div>

              <h2>
                Prediction Results
              </h2>

              <p>
                Enter your crop information
                and click the prediction button.
              </p>

            </div>

          )}


          {loading && (

            <div className="result-placeholder">

              <div className="loading-icon">
                🌱
              </div>

              <h2>
                Analyzing...
              </h2>

              <p>
                Your Random Forest model is
                generating the prediction.
              </p>

            </div>

          )}


          {result && (

            <div className="prediction-results">

              {/* RESULT HEADER */}

              <div className="result-header">

                <div>

                  <div className="section-label">
                    PREDICTION RESULT
                  </div>

                  <h2>
                    {result.crop}
                  </h2>

                  <p>
                    Temperature:{" "}
                    {result.temperature}°C
                  </p>

                </div>

              </div>


              {/* SOIL TYPE */}

              <div className="soil-result-card">

                <div className="soil-result-icon">
                  🌱
                </div>

                <div>

                  <span>
                    SUITABLE SOIL TYPE
                  </span>

                  <h1>
                    {result.soil_type}
                  </h1>

                </div>

              </div>


              {/* OTHER PREDICTIONS */}

              <h3 className="requirements-title">
                Predicted Requirements
              </h3>


              <div className="requirements-grid">

                {/* HUMIDITY */}

                <div className="requirement-card">

                  <div>
                    💧
                  </div>

                  <span>
                    Humidity
                  </span>

                  <strong>
                    {result.humidity}%
                  </strong>

                </div>


                {/* MOISTURE */}

                <div className="requirement-card">

                  <div>
                    💦
                  </div>

                  <span>
                    Moisture
                  </span>

                  <strong>
                    {result.moisture}%
                  </strong>

                </div>


                {/* NITROGEN */}

                <div className="requirement-card">

                  <div>
                    🧪
                  </div>

                  <span>
                    Nitrogen
                  </span>

                  <strong>
                    {result.nitrogen}
                  </strong>

                </div>


                {/* POTASSIUM */}

                <div className="requirement-card">

                  <div>
                    ⚗️
                  </div>

                  <span>
                    Potassium
                  </span>

                  <strong>
                    {result.potassium}
                  </strong>

                </div>


                {/* PHOSPHORUS */}

                <div className="requirement-card">

                  <div>
                    🧬
                  </div>

                  <span>
                    Phosphorus
                  </span>

                  <strong>
                    {result.phosphorus}
                  </strong>

                </div>

              </div>

            </div>

          )}

        </div>

      </section>

    </div>

  );
}

export default SoilPrediction;