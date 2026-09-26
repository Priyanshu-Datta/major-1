from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os
from huggingface_hub import hf_hub_download

app = Flask(__name__)
CORS(app)

# ---------------------------------------
# LOAD TRAINED MODEL
# ---------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# -----------------------------------------
# LOAD TRAINED MODEL FROM HUGGING FACE
# -----------------------------------------

MODEL_PATH = hf_hub_download(
    repo_id="priyanshudatta80/crop-prediction-model",
    filename="crop_prediction_model.pkl"
)

with open(MODEL_PATH, "rb") as file:
    data = pickle.load(file)

crop_encoder = data["crop_encoder"]
soil_encoder = data["soil_encoder"]

soil_model = data["soil_model"]
humidity_model = data["humidity_model"]
moisture_model = data["moisture_model"]
nitrogen_model = data["nitrogen_model"]
potassium_model = data["potassium_model"]
phosphorus_model = data["phosphorus_model"]


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

        data_received = request.get_json()

        crop_name = data_received.get("crop")
        temperature = float(data_received.get("temperature"))

        # Check crop
        if crop_name not in crop_encoder.classes_:
            return jsonify({
                "error": "Crop not found in the trained dataset."
            }), 400

        # Encode crop
        crop_encoded = crop_encoder.transform([crop_name])[0]

        # Create input dataframe
        input_data = pd.DataFrame(
            [[crop_encoded, temperature]],
            columns=["Crop_Encoded", "Temparature"]
        )

        # ---------------------------------------
        # PREDICTIONS
        # ---------------------------------------

        soil_prediction = soil_model.predict(input_data)

        soil_type = soil_encoder.inverse_transform(
            soil_prediction
        )[0]

        humidity = humidity_model.predict(input_data)[0]

        moisture = moisture_model.predict(input_data)[0]

        nitrogen = nitrogen_model.predict(input_data)[0]

        potassium = potassium_model.predict(input_data)[0]

        phosphorus = phosphorus_model.predict(input_data)[0]


        # ---------------------------------------
        # RETURN RESULT
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
# HOME
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