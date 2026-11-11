from ultralytics import YOLO
from pathlib import Path

# Current folder
BASE_DIR = Path(__file__).resolve().parent

# Model path
MODEL_PATH = BASE_DIR / "best.pt"

print("Loading model:", MODEL_PATH)

# Load YOLO model
model = YOLO(str(MODEL_PATH))

print("\n================================")
print("PLANT DISEASE MODEL INFORMATION")
print("================================")

print("Total Classes:", len(model.names))

print("\nAll Disease Classes:\n")

for i, name in model.names.items():
    print(f"{i}: {name}")

print("\n================================")
print("COMPLETED")
print("================================")