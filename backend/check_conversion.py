import pickle
import sys
import importlib
from pathlib import Path

import numpy as np
import pandas as pd
import numpy.core

# NumPy compatibility
sys.modules["numpy._core"] = numpy.core

for module_name in [
    "numeric",
    "multiarray",
    "umath",
    "numerictypes",
    "fromnumeric",
    "shape_base",
    "_multiarray_umath"
]:
    try:
        module = importlib.import_module(
            f"numpy.core.{module_name}"
        )
        sys.modules[f"numpy._core.{module_name}"] = module
    except ImportError:
        pass

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
MODEL_DIR = PROJECT_DIR / "model"

ORIGINAL_PATH = MODEL_DIR / "crop_prediction_model.pkl"
CONVERTED_PATH = MODEL_DIR / "crop_prediction_model_converted.pkl"

# Load both models
with open(ORIGINAL_PATH, "rb") as f:
    original = pickle.load(f)

with open(CONVERTED_PATH, "rb") as f:
    converted = pickle.load(f)

print("Both models loaded successfully.")

# Compare encoders
assert np.array_equal(
    original["crop_encoder"].classes_,
    converted["crop_encoder"].classes_
)

assert np.array_equal(
    original["soil_encoder"].classes_,
    converted["soil_encoder"].classes_
)

print("Encoder comparison: PASSED")

# Test several crops and temperatures
crop_encoder = original["crop_encoder"]

test_crops = list(crop_encoder.classes_)[:10]
temperatures = [20, 25, 30, 35]

test_data = pd.DataFrame(
    [
        [crop_encoder.transform([crop])[0], temp]
        for crop in test_crops
        for temp in temperatures
    ],
    columns=["Crop_Encoded", "Temparature"]
)

# Original predictions
original_soil = original["soil_model"].predict(test_data)
original_values = original["regression_model"].predict(test_data)

# Converted predictions
converted_soil = converted["soil_model"].predict(test_data)
converted_values = converted["regression_model"].predict(test_data)

# Compare results
soil_match = np.array_equal(original_soil, converted_soil)

values_match = np.allclose(
    original_values,
    converted_values,
    rtol=1e-7,
    atol=1e-9,
    equal_nan=True
)

print("Soil predictions match:", soil_match)
print("Numerical predictions match:", values_match)

if soil_match and values_match:
    print("\nSUCCESS: Original and converted predictions match.")
else:
    print("\nWARNING: Predictions differ. Do not replace the original model.")