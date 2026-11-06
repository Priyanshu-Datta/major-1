import os
import json
import numpy as np

from io import BytesIO

from flask import Blueprint, request, jsonify

# ============================================================
# 1. CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECT_DIR = os.path.dirname(BASE_DIR)

MODEL_PATH = os.path.join(
    PROJECT_DIR,
    "model",
    "plant_disease_recog_model_pwp.keras"
)

CLASS_PATH = os.path.join(
    BASE_DIR,
    "class_names.json"
)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

# Keep False because your successful notebook prediction
# used raw pixel values without dividing by 255.

NORMALIZE = False


# ============================================================
# 2. CREATE BLUEPRINT
# ============================================================

disease_bp = Blueprint(
    "disease",
    __name__
)


# ============================================================
# 3. LOAD TRAINED MODEL
# ============================================================

print("\n========================================")
print("LOADING PLANT DISEASE DETECTION MODEL")
print("========================================")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

# ============================================================
# LAZY MODEL LOADING
# ============================================================

model = None

IMG_HEIGHT = None
IMG_WIDTH = None
NUM_CLASSES = None


def get_model():

    global model
    global IMG_HEIGHT
    global IMG_WIDTH
    global NUM_CLASSES

    if model is None:

        print("Loading TensorFlow...")

        from tensorflow.keras.models import load_model

        print("Loading Plant Disease Model...")

        model = load_model(
            MODEL_PATH,
            compile=False
        )

        IMG_HEIGHT = int(model.input_shape[1])
        IMG_WIDTH = int(model.input_shape[2])

        NUM_CLASSES = int(model.output_shape[-1])

        print("Plant Disease Model Loaded!")

        print("Input Shape:", model.input_shape)
        print("Output Shape:", model.output_shape)

    return model

print("Plant Disease Model Loaded Successfully!")

# Get model input dimensions

IMG_HEIGHT = int(model.input_shape[1])
IMG_WIDTH = int(model.input_shape[2])

NUM_CLASSES = int(model.output_shape[-1])

print("Model Input Shape:", model.input_shape)
print("Model Output Shape:", model.output_shape)
print("Image Height:", IMG_HEIGHT)
print("Image Width:", IMG_WIDTH)
print("Number of Classes:", NUM_CLASSES)


# ============================================================
# 4. LOAD CLASS NAMES
# ============================================================

if not os.path.exists(CLASS_PATH):
    raise FileNotFoundError(
        f"Class names file not found: {CLASS_PATH}"
    )

with open(CLASS_PATH, "r") as file:
    CLASS_NAMES = json.load(file)

if not isinstance(CLASS_NAMES, list):
    raise ValueError(
        "class_names.json must contain a JSON list."
    )

if len(CLASS_NAMES) != NUM_CLASSES:
    raise ValueError(
        f"Model expects {NUM_CLASSES} classes, "
        f"but class_names.json contains {len(CLASS_NAMES)}."
    )

print("Total Classes Loaded:", len(CLASS_NAMES))
print("Class Names Loaded Successfully!")


# ============================================================
# 5. CHECK IMAGE EXTENSION
# ============================================================

def allowed_file(filename):

    return (
        filename != ""
        and "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


# ============================================================
# 6. IMAGE PREPROCESSING
# ============================================================

def preprocess_image(uploaded_file):

    from tensorflow.keras.preprocessing import image

    current_model = get_model()

    uploaded_file.stream.seek(0)

    image_bytes = uploaded_file.stream.read()

    if not image_bytes:
        raise ValueError("Uploaded image is empty.")

    image_stream = BytesIO(image_bytes)

    img = image.load_img(
        image_stream,
        target_size=(IMG_HEIGHT, IMG_WIDTH),
        color_mode="rgb"
    )

    img_array = image.img_to_array(img)

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    if NORMALIZE:
        img_array = img_array / 255.0

    return img_array


# ============================================================
# 7. PLANT DISEASE PREDICTION FUNCTION
# ============================================================

def predict_plant_disease(uploaded_file):

    current_model = get_model()

    img_array = preprocess_image(uploaded_file)

    predictions = current_model.predict(
        img_array,
        verbose=0
    )[0]

    predicted_index = int(np.argmax(predictions))

    predicted_disease = CLASS_NAMES[predicted_index]

    confidence = float(
        predictions[predicted_index] * 100
    )

    return {
        "disease": predicted_disease,
        "confidence": round(confidence, 2)
    }

# ============================================================
# 8. FLASK PREDICTION API
# ============================================================

@disease_bp.route(
    "/predict-disease",
    methods=["POST"]
)

def predict_disease_api():

    try:

        # Check whether image exists
        if "image" not in request.files:

            return jsonify({
                "success": False,
                "error": "No image uploaded."
            }), 400

        image_file = request.files["image"]

        # Check filename
        if image_file.filename == "":

            return jsonify({
                "success": False,
                "error": "Please select an image."
            }), 400

        # Check image extension
        if not allowed_file(image_file.filename):

            return jsonify({
                "success": False,
                "error": "Only JPG, JPEG and PNG images are allowed."
            }), 400

        # Generate prediction
        result = predict_plant_disease(
            image_file
        )

        print("\n========================================")
        print("PLANT DISEASE PREDICTION")
        print("========================================")
        print("Disease:", result["disease"])
        print("Confidence:", result["confidence"], "%")
        print("========================================")

        # Return successful response
        return jsonify({

            "success": True,

            "disease": result["disease"],

            "confidence": result["confidence"],

            "message": "Disease prediction successful."

        }), 200

    except Exception as e:

        print("\nPLANT DISEASE PREDICTION ERROR:")
        print(str(e))

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500


# ============================================================
# 9. API HEALTH CHECK
# ============================================================

@disease_bp.route(
    "/disease-health",
    methods=["GET"]
)

def disease_health():

    return jsonify({

        "success": True,

        "message": "Plant Disease Detection API is running.",

        "model_loaded": model is not None,

        "number_of_classes": len(CLASS_NAMES),
        
        "image_size": [
            IMG_HEIGHT,
            IMG_WIDTH
        ]

    }), 200