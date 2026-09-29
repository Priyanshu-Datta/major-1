from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# ---------------------------------------
# FIND PROJECT ROOT DIRECTORY
# ---------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# ---------------------------------------
# MODEL PATH
# ---------------------------------------

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "crop_prediction_model.pkl"
)

print("Loading model from:")
print(MODEL_PATH)

# Check whether model exists
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model file not found: {MODEL_PATH}"
    )

# ---------------------------------------
# LOAD MODEL
# ---------------------------------------

with open(MODEL_PATH, "rb") as file:
    model_data = pickle.load(file)

crop_encoder = model_data["crop_encoder"]
soil_encoder = model_data["soil_encoder"]

soil_model = model_data["soil_model"]
regression_model = model_data["regression_model"]

print("Model loaded successfully!")

print("Available model components:")
print(model_data.keys())


# ---------------------------------------
# GET AVAILABLE CROPS
# ---------------------------------------

@app.route("/crops", methods=["GET"])
def get_crops():

    crops = crop_encoder.classes_.tolist()

    return jsonify({
        "crops": crops
    })


# ---------------------------------------
# PREDICTION API
# ---------------------------------------

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get JSON data
        data_received = request.get_json()

        if not data_received:
            return jsonify({
                "error": "No JSON data received."
            }), 400

        # Get crop
        crop_name = data_received.get("crop")

        # Get temperature
        temperature = data_received.get("temperature")

        # Check crop
        if crop_name is None:
            return jsonify({
                "error": "Crop is required."
            }), 400

        # Check temperature
        if temperature is None:
            return jsonify({
                "error": "Temperature is required."
            }), 400

        # Convert temperature to float
        temperature = float(temperature)

        # ---------------------------------------
        # CHECK WHETHER CROP EXISTS
        # ---------------------------------------

        if crop_name not in crop_encoder.classes_:

            return jsonify({
                "error": "Crop not found in the trained dataset."
            }), 400

        # ---------------------------------------
        # ENCODE CROP
        # ---------------------------------------

        crop_encoded = crop_encoder.transform(
            [crop_name]
        )[0]

        # ---------------------------------------
        # CREATE INPUT DATA
        # ---------------------------------------

        input_data = pd.DataFrame(
            [[crop_encoded, temperature]],
            columns=[
                "Crop_Encoded",
                "Temparature"
            ]
        )

        # ---------------------------------------
        # SOIL TYPE PREDICTION
        # ---------------------------------------

        soil_prediction = soil_model.predict(
            input_data
        )

        soil_type = soil_encoder.inverse_transform(
            soil_prediction
        )[0]

        # ---------------------------------------
        # NUMERICAL PREDICTION
        # ---------------------------------------

        numerical_prediction = regression_model.predict(
            input_data
        )

        # Get first row
        numerical_values = numerical_prediction[0]

        # ---------------------------------------
        # EXTRACT VALUES
        # ---------------------------------------

        humidity = numerical_values[0]
        moisture = numerical_values[1]
        nitrogen = numerical_values[2]
        potassium = numerical_values[3]
        phosphorus = numerical_values[4]

        # ---------------------------------------
        # CREATE RESULT
        # ---------------------------------------

        result = {
            "crop": crop_name,
            "temperature": round(temperature, 2),
            "soil_type": str(soil_type),
            "humidity": round(float(humidity), 2),
            "moisture": round(float(moisture), 2),
            "nitrogen": round(float(nitrogen), 2),
            "potassium": round(float(potassium), 2),
            "phosphorus": round(float(phosphorus), 2)
        }

        return jsonify(result)

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ---------------------------------------
# HOME ROUTE
# ---------------------------------------

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Crop Prediction API is running"
    })


# ---------------------------------------
# START SERVER
# ---------------------------------------

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )