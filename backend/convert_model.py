import pickle
import sys
import shutil
import importlib
from pathlib import Path

import numpy as np

# =========================================
# NUMPY 2.x PICKLE COMPATIBILITY
# =========================================

# Import NumPy 1.26 modules
import numpy.core

numpy_modules = [
    "numeric",
    "multiarray",
    "umath",
    "numerictypes",
    "fromnumeric",
    "shape_base",
    "_multiarray_umath"
]

# Map NumPy 2.x module paths to NumPy 1.26 paths
sys.modules["numpy._core"] = numpy.core

for module_name in numpy_modules:
    try:
        old_module = importlib.import_module(
            f"numpy.core.{module_name}"
        )

        sys.modules[
            f"numpy._core.{module_name}"
        ] = old_module

    except ImportError:
        print("Could not import:", module_name)

# =========================================
# CORRECT MODEL PATHS
# =========================================

BASE_DIR = Path(__file__).resolve().parent

PROJECT_DIR = BASE_DIR.parent

MODEL_DIR = PROJECT_DIR / "model"

MODEL_PATH = MODEL_DIR / "crop_prediction_model.pkl"

BACKUP_PATH = MODEL_DIR / "crop_prediction_model_backup.pkl"

CONVERTED_PATH = MODEL_DIR / "crop_prediction_model_converted.pkl"

# =========================================
# CHECK ENVIRONMENT
# =========================================

print("=" * 50)
print("SOIL MODEL CONVERSION")
print("=" * 50)

print("NumPy version:", np.__version__)

print("Original model:", MODEL_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

# =========================================
# BACKUP ORIGINAL MODEL
# =========================================

if not BACKUP_PATH.exists():

    shutil.copy2(
        MODEL_PATH,
        BACKUP_PATH
    )

    print("Original model backup created.")

else:
    print("Existing backup preserved.")

# =========================================
# LOAD ORIGINAL MODEL
# =========================================

print("\nLoading original soil model...")

with open(MODEL_PATH, "rb") as file:

    model_data = pickle.load(file)

print("Original model loaded successfully!")

print("Model components:", model_data.keys())

# =========================================
# CHECK MODEL COMPONENTS
# =========================================

required_keys = {
    "crop_encoder",
    "soil_encoder",
    "soil_model",
    "regression_model"
}

if not isinstance(model_data, dict):
    raise TypeError("Expected a dictionary model.")

missing_keys = required_keys - model_data.keys()

if missing_keys:
    raise ValueError(
        f"Missing components: {missing_keys}"
    )

# =========================================
# SAVE CONVERTED COPY
# =========================================

print("\nSaving converted model...")

with open(CONVERTED_PATH, "wb") as file:

    pickle.dump(
        model_data,
        file,
        protocol=4
    )

print("Converted model saved.")

# =========================================
# VERIFY CONVERTED MODEL
# =========================================

print("\nVerifying converted model...")

with open(CONVERTED_PATH, "rb") as file:

    verified_model = pickle.load(file)

print("Converted model loaded successfully!")

print("Verified components:", verified_model.keys())

print("\nOriginal model preserved:")
print(BACKUP_PATH)

print("\nConverted model:")
print(CONVERTED_PATH)

print("\nCONVERSION COMPLETED SUCCESSFULLY!")