import os
import threading
from pathlib import Path
from io import BytesIO

from flask import Blueprint, request, jsonify
from PIL import Image

# =========================================
# CONFIGURATION
# =========================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

MODEL_PATH = PROJECT_DIR / "model" / "best.pt"

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

disease_bp = Blueprint("disease", __name__)

# =========================================
# LAZY MODEL LOADING
# =========================================

model = None
model_lock = threading.Lock()


def get_model():

    global model

    if model is None:

        with model_lock:

            if model is None:

                print("Loading YOLO Disease Model...")

                from ultralytics import YOLO

                if not MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"Model not found: {MODEL_PATH}"
                    )

                model = YOLO(str(MODEL_PATH))

                print("Model loaded successfully!")
                print("Classes:", model.names)
                print("Total classes:", len(model.names))

    return model


# =========================================
# IMAGE VALIDATION
# =========================================

def allowed_file(filename):

    return (
        filename != ""
        and "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# =========================================
# DISEASE PREDICTION
# =========================================

def predict_plant_disease(image_file):

    yolo_model = get_model()

    image_bytes = image_file.read()

    if not image_bytes:
        raise ValueError("Uploaded image is empty.")

    img = Image.open(
        BytesIO(image_bytes)
    ).convert("RGB")

    # Limit extremely large images
    img.thumbnail((1024, 1024))

    # YOLO classification prediction
    results = yolo_model.predict(
        source=img,
        verbose=False,
        device="cpu",
        imgsz=224
    )

    result = results[0]

    probabilities = result.probs

    if probabilities is None:
        raise ValueError(
            "The model does not return classification probabilities."
        )

    predicted_index = int(probabilities.top1)

    disease_name = result.names[predicted_index]

    confidence = float(
        probabilities.top1conf
    ) * 100

    # Top 3 predictions
    top_predictions = []

    for class_id in probabilities.top5[:3]:

        class_id = int(class_id)

        top_predictions.append({

            "disease": result.names[class_id],

            "confidence": round(
                float(probabilities.data[class_id]) * 100,
                2
            )

        })

    return {

        "disease": disease_name,

        "confidence": round(confidence, 2),

        "top_predictions": top_predictions

    }


# =========================================
# DISEASE PREDICTION API
# =========================================

@disease_bp.route(
    "/predict-disease",
    methods=["POST"]
)
def predict_disease_api():

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": "No image uploaded."
            }), 400

        image_file = request.files["image"]

        if image_file.filename == "":

            return jsonify({
                "success": False,
                "error": "Please select an image."
            }), 400

        if not allowed_file(image_file.filename):

            return jsonify({
                "success": False,
                "error": "Only JPG, JPEG and PNG allowed."
            }), 400

        result = predict_plant_disease(image_file)

        return jsonify({

            "success": True,

            "disease": result["disease"],

            "confidence": result["confidence"],

            "top_predictions": result["top_predictions"],

            "message": "Disease prediction successful."

        }), 200

    except Exception as e:

        print("Disease Prediction Error:", str(e))

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# =========================================
# HEALTH CHECK
# =========================================

@disease_bp.route(
    "/disease-health",
    methods=["GET"]
)
def disease_health():

    return jsonify({

        "success": True,

        "message": "YOLO Disease Detection API is running.",

        "model_loaded": model is not None,

        "number_of_classes": (
            len(model.names) if model is not None else 0
        )

    }), 200
