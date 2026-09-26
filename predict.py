import pickle
import pandas as pd

# ---------------------------------
# LOAD TRAINED MODEL
# ---------------------------------

with open("major-1/model/crop_prediction_model.pkl", "rb") as file:
    data = pickle.load(file)

# Load encoders
crop_encoder = data["crop_encoder"]
soil_encoder = data["soil_encoder"]

# Load models
soil_model = data["soil_model"]
humidity_model = data["humidity_model"]
moisture_model = data["moisture_model"]
nitrogen_model = data["nitrogen_model"]
potassium_model = data["potassium_model"]
phosphorus_model = data["phosphorus_model"]


# ---------------------------------
# SHOW AVAILABLE CROPS
# ---------------------------------

print("\nAvailable Crops:")

for crop in crop_encoder.classes_:
    print("-", crop)


# ---------------------------------
# TAKE USER INPUT
# ---------------------------------

crop_name = input("\nEnter Crop Name: ").strip()
temperature = float(input("Enter Temperature: "))


# ---------------------------------
# CHECK CROP NAME
# ---------------------------------

if crop_name not in crop_encoder.classes_:
    print("\n❌ Crop name not found in dataset!")
    print("Please enter one of the available crop names.")

else:

    # Encode crop name
    crop_encoded = crop_encoder.transform([crop_name])[0]

    # IMPORTANT:
    # Column names should match training data
    input_data = pd.DataFrame(
        [[crop_encoded, temperature]],
        columns=["Crop_Encoded", "Temparature"]
    )

    # ---------------------------------
    # MAKE PREDICTIONS
    # ---------------------------------

    # Soil Type
    soil_encoded = soil_model.predict(input_data)
    soil_type = soil_encoder.inverse_transform(soil_encoded)[0]

    # Other predictions
    humidity = humidity_model.predict(input_data)[0]
    moisture = moisture_model.predict(input_data)[0]
    nitrogen = nitrogen_model.predict(input_data)[0]
    potassium = potassium_model.predict(input_data)[0]
    phosphorus = phosphorus_model.predict(input_data)[0]


    # ---------------------------------
    # DISPLAY RESULTS
    # ---------------------------------

    print("\n" + "=" * 40)
    print("🌱 CROP REQUIREMENT PREDICTION")
    print("=" * 40)

    print(f"\n🌾 Crop Name: {crop_name}")
    print(f"🌡️ Temperature: {temperature} °C")

    print("\n" + "-" * 40)
    print(f"🌱 SOIL TYPE: {soil_type}")
    print("-" * 40)

    print(f"💧 Humidity:   {humidity:.2f}")
    print(f"💦 Moisture:   {moisture:.2f}")
    print(f"🧪 Nitrogen:   {nitrogen:.2f}")
    print(f"⚗️ Potassium:  {potassium:.2f}")
    print(f"🧬 Phosphorus: {phosphorus:.2f}")

    print("\n" + "=" * 40)