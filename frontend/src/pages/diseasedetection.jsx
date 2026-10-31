import { useState } from "react";

import "./diseasedetection.css";


function diseasedetection() {

  // ============================================================
  // 1. STATES
  // ============================================================

  const [selectedImage, setSelectedImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // Flask backend URL
  const API_URL = import.meta.env.VITE_API_BASE_URL
    || "http://127.0.0.1:5000";


  // ============================================================
  // 2. IMAGE UPLOAD
  // ============================================================

  const handleImageChange = (event) => {

    const file = event.target.files[0];

    if (!file) return;

    setError("");
    setResult(null);

    if (!["image/jpeg", "image/png"].includes(file.type)
        && file.type !== "image/jpg") {

      setError("Please upload a JPG, JPEG or PNG image.");

      return;
    }

    setSelectedImage(file);

    setPreview(URL.createObjectURL(file));

  };


  // ============================================================
  // 3. PREDICTION
  // ============================================================

  const handlePredict = async () => {

    if (!selectedImage) {

      setError("Please upload a leaf image first.");

      return;
    }

    setLoading(true);

    setError("");

    setResult(null);

    try {

      const formData = new FormData();

      formData.append(
        "image",
        selectedImage
      );

      const response = await fetch(
        `${API_URL}/predict-disease`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.error || "Prediction failed."
        );

      }

      setResult(data);

    }

    catch (err) {

      setError(
        err.message || "Unable to connect to the backend."
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ============================================================
  // 4. RESET
  // ============================================================

  const handleReset = () => {

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelectedImage(null);

    setPreview(null);

    setResult(null);

    setError("");

    setLoading(false);

  };


  // ============================================================
  // 5. UI
  // ============================================================

  return (

    <div className="disease-page">

      {/* HEADER */}

      <section className="disease-heading">

        <span className="disease-label">
          🌿 CROPSENSE INTELLIGENCE
        </span>

        <h1>
          Plant Disease Detection
        </h1>

        <p>
          Identify plant diseases using deep learning
          and advanced image processing.
          Upload a leaf image to analyze its health.
        </p>

      </section>


      {/* MAIN CONTAINER */}

      <section className="disease-container">


        {/* UPLOAD CARD */}

        <div className="disease-upload-card">

          <div className="disease-icon">
            🌱
          </div>

          <h2>
            Upload Leaf Image
          </h2>

          <p>
            Select a clear image of the plant leaf
            for disease detection.
          </p>


          {/* IMAGE UPLOAD */}

          <label
            htmlFor="leaf-upload"
            className="upload-area"
          >

            {preview ? (

              <img
                src={preview}
                alt="Uploaded leaf"
                className="leaf-preview"
              />

            ) : (

              <div className="upload-placeholder">

                <span>📸</span>

                <strong>
                  Click to upload image
                </strong>

                <small>
                  JPG, JPEG or PNG
                </small>

              </div>

            )}

          </label>


          <input
            id="leaf-upload"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleImageChange}
            hidden
          />


          {/* FILE NAME */}

          {selectedImage && (

            <div className="selected-file">

              📄 {selectedImage.name}

            </div>

          )}


          {/* BUTTONS */}

          <div className="disease-buttons">

            <button
              className="predict-button"
              onClick={handlePredict}
              disabled={loading || !selectedImage}
            >

              {loading
                ? "Analyzing Leaf..."
                : "Detect Disease →"
              }

            </button>


            <button
              className="reset-button"
              onClick={handleReset}
              disabled={loading}
            >

              Reset

            </button>

          </div>


          {/* ERROR */}

          {error && (

            <div className="disease-error">

              ⚠️ {error}

            </div>

          )}

        </div>


        {/* RESULT CARD */}

        <div className="disease-result-card">


          {!result && !loading && (

            <div className="result-placeholder">

              <div className="result-icon">
                🌿
              </div>

              <h2>
                Detection Results
              </h2>

              <p>
                Upload a plant leaf image and click
                Detect Disease to see the prediction.
              </p>

            </div>

          )}


          {/* LOADING */}

          {loading && (

            <div className="result-placeholder">

              <div className="loading-icon">
                🌱
              </div>

              <h2>
                Analyzing Image...
              </h2>

              <p>
                Our deep learning model is examining
                the leaf and identifying possible diseases.
              </p>

            </div>

          )}


          {/* PREDICTION RESULTS */}

          {result && (

            <div className="disease-results">

              <span className="disease-label">
                PREDICTION SUCCESSFUL
              </span>

              <h2>
                Analysis Complete
              </h2>


              {/* DISEASE */}

              <div className="detected-disease">

                <span>
                  🌿 DETECTED CONDITION
                </span>

                <h1>
                  {result.disease.replaceAll("_", " ")}
                </h1>

              </div>


              {/* CONFIDENCE */}

              <div className="confidence-card">

                <span>
                  Prediction Confidence
                </span>

                <strong>
                  {result.confidence}%
                </strong>


                <div className="confidence-bar">

                  <div
                    className="confidence-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, result.confidence)
                      )}%`
                    }}
                  />

                </div>

              </div>


              {/* STATUS */}

              <div className="prediction-status">

                {result.disease.toLowerCase().includes("healthy")

                  ? "✅ The model classified this leaf as healthy."

                  : "⚠️ The model detected a potential plant disease."

                }

              </div>


              <p className="result-disclaimer">
                This result is generated by a trained
                machine learning model. Verify important
                agricultural decisions with an expert.
              </p>

            </div>

          )}

        </div>

      </section>

    </div>

  );

}

export default diseasedetection;