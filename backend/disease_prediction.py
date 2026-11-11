import threading
from pathlib import Path
from io import BytesIO

import numpy as np
import onnxruntime as ort

from PIL import Image
from flask import Blueprint, request, jsonify


# ==================================================
# CONFIGURATION
# ==================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

MODEL_PATH = PROJECT_DIR / "model" / "best.onnx"

IMAGE_SIZE = 224

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

disease_bp = Blueprint("disease", __name__)


# ==================================================
# YOLO CLASS NAMES
# Must match the original best.pt class order
# ==================================================

CLASS_NAMES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]


# ==================================================
# LAZY ONNX MODEL LOADING
# ==================================================

session = None
model_lock = threading.Lock()


def get_model():

    global session

    if session is None:

        with model_lock:

            if session is None:

                print("Loading ONNX Disease Detection Model...")

                if not MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"ONNX model not found: {MODEL_PATH}"
                    )

                options = ort.SessionOptions()

                options.intra_op_num_threads = 1
                options.inter_op_num_threads = 1

                options.execution_mode = (
                    ort.ExecutionMode.ORT_SEQUENTIAL
                )

                session = ort.InferenceSession(
                    str(MODEL_PATH),
                    sess_options=options,
                    providers=["CPUExecutionProvider"]
                )

                print("ONNX model loaded successfully!")

                print("Number of classes:", len(CLASS_NAMES))

    return session


# ==================================================
# IMAGE VALIDATION
# ==================================================

def allowed_file(filename):

    return (
        filename != ""
        and "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ==================================================
# IMAGE PREPROCESSING
# ==================================================

def preprocess_image(image_file):

    image_bytes = image_file.read()

    if not image_bytes:
        raise ValueError("Uploaded image is empty.")

    image = Image.open(
        BytesIO(image_bytes)
    ).convert("RGB")

    image = image.resize(
        (IMAGE_SIZE, IMAGE_SIZE),
        Image.Resampling.BILINEAR
    )

    image_array = np.asarray(
        image,
        dtype=np.float32
    ) / 255.0

    # HWC -> CHW
    image_array = np.transpose(
        image_array,
        (2, 0, 1)
    )

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    return np.ascontiguousarray(
        image_array,
        dtype=np.float32
    )


# ==================================================
# DISEASE PREDICTION
# ==================================================

def predict_plant_disease(image_file):

    onnx_model = get_model()

    input_tensor = preprocess_image(image_file)

    input_name = onnx_model.get_inputs()[0].name

    output = onnx_model.run(
        None,
        {
            input_name: input_tensor
        }
    )[0]

    scores = np.asarray(
        output[0],
        dtype=np.float64
    )

    if len(scores) != len(CLASS_NAMES):
        raise ValueError(
            "Model output does not match the 38 disease classes."
        )

    # Convert logits to probabilities.
    # If output is already probabilities, preserve it.
    if (
        np.all(scores >= 0)
        and np.all(scores <= 1)
        and np.isclose(np.sum(scores), 1.0, atol=1e-3)
    ):
        probabilities = scores
    else:
        shifted = scores - np.max(scores)

        exp_scores = np.exp(shifted)

        probabilities = (
            exp_scores / np.sum(exp_scores)
        )

    predicted_index = int(
        np.argmax(probabilities)
    )

    disease_name = CLASS_NAMES[predicted_index]

    confidence = float(
        probabilities[predicted_index] * 100
    )

    top_indices = np.argsort(
        probabilities
    )[::-1][:3]

    top_predictions = []

    for index in top_indices:

        index = int(index)

        top_predictions.append({

            "disease": CLASS_NAMES[index],

            "confidence": round(
                float(probabilities[index] * 100),
                2
            )

        })

    return {

        "disease": disease_name,

        "confidence": round(confidence, 2),

        "top_predictions": top_predictions

    }


# ==================================================
# DISEASE PREDICTION API
# ==================================================

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

    except Exception as error:

        print(
            "Disease Prediction Error:",
            repr(error)
        )

        return jsonify({

            "success": False,

            "error": str(error)

        }), 500


# ==================================================
# HEALTH CHECK
# ==================================================

@disease_bp.route(
    "/disease-health",
    methods=["GET"]
)
def disease_health():

    return jsonify({

        "success": True,

        "message": "ONNX Disease Detection API is running.",

        "model_loaded": session is not None,

        "number_of_classes": len(CLASS_NAMES)

    }), 200