from ultralytics import YOLO
from pathlib import Path

# Get project directory automatically
BASE_DIR = Path(__file__).resolve().parent

# Original YOLO model
MODEL_PATH = BASE_DIR / "model" / "best.pt"

print("Model path:", MODEL_PATH)

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

# Load original model
print("Loading YOLO model...")

model = YOLO(str(MODEL_PATH))

# Display classes
print("\nOriginal model classes:")
print(model.names)

print("\nTotal classes:", len(model.names))

# Export to ONNX
print("\nExporting model to ONNX...")

onnx_path = model.export(
    format="onnx",
    imgsz=224,
    dynamic=False,
    simplify=False,
    opset=12
)

print("\nONNX export completed!")
print("ONNX model saved at:", onnx_path)