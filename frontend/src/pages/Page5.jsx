import React, { useMemo, useState } from "react";
import "./Page5.css";

const diseases = [
  {
    crop: "Apple",
    disease: "Apple Scab",
    symptoms: "Olive-green or dark scaly spots appear on leaves and fruits. Infected leaves may curl and fall.",
    treatment: "Remove infected leaves and fallen fruits. Prune branches to improve airflow. Apply an appropriate fungicide when necessary.",
    medicines: "Examples: Captan, Mancozeb or suitable products containing other locally registered apple-scab fungicides.",
    prevention: "Use resistant varieties, maintain orchard hygiene and avoid overhead irrigation."
  },
  {
    crop: "Apple",
    disease: "Black Rot",
    symptoms: "Brown circular leaf spots, rotting fruits and dark cankers on branches.",
    treatment: "Remove and destroy infected fruits and branches. Prune cankers and maintain good orchard sanitation.",
    medicines: "Suitable registered fungicides such as Captan may help protect healthy fruit when applied according to the label.",
    prevention: "Remove mummified fruits, prune regularly and avoid leaving infected plant material in the orchard."
  },
  {
    crop: "Apple",
    disease: "Cedar Apple Rust",
    symptoms: "Bright orange or yellow spots develop on apple leaves. Severe infection can cause premature leaf fall.",
    treatment: "Remove nearby infected cedar or juniper galls where practical. Protect apple trees during susceptible periods.",
    medicines: "Examples include suitable registered Myclobutanil or other rust-control fungicides.",
    prevention: "Choose resistant apple varieties and maintain good orchard spacing."
  },
  {
    crop: "Apple",
    disease: "Healthy",
    symptoms: "Leaves appear green and normal, without visible disease symptoms.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required. Avoid unnecessary fungicide applications.",
    prevention: "Continue regular monitoring, balanced fertilization and proper watering."
  },
  {
    crop: "Blueberry",
    disease: "Healthy",
    symptoms: "Healthy green leaves without visible disease spots or abnormal growth.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain acidic soil conditions suitable for blueberries and provide proper drainage."
  },
  {
    crop: "Cherry",
    disease: "Powdery Mildew",
    symptoms: "White powder-like fungal growth appears on leaves and shoots. Leaves may become distorted.",
    treatment: "Remove severely infected shoots and improve airflow. Apply suitable fungicides if infection is significant.",
    medicines: "Examples: Sulfur-based products or locally registered powdery mildew fungicides.",
    prevention: "Avoid excessive nitrogen fertilizer and maintain proper spacing."
  },
  {
    crop: "Cherry",
    disease: "Healthy",
    symptoms: "Leaves are green and normally developed without visible fungal growth.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain orchard hygiene and inspect leaves regularly."
  },
  {
    crop: "Corn",
    disease: "Cercospora Leaf Spot / Gray Leaf Spot",
    symptoms: "Long rectangular gray or brown lesions develop on leaves, often between leaf veins.",
    treatment: "Remove heavily infected crop residues where practical and use crop rotation. Consider fungicides when justified.",
    medicines: "Examples: Registered products containing Azoxystrobin or other approved corn leaf-blight fungicides.",
    prevention: "Use resistant hybrids, rotate crops and avoid continuous maize cultivation."
  },
  {
    crop: "Corn",
    disease: "Common Rust",
    symptoms: "Small reddish-brown raised pustules appear on both surfaces of corn leaves.",
    treatment: "Use resistant hybrids. Fungicide treatment may be considered when infection is severe and economically justified.",
    medicines: "Examples: Registered Tebuconazole or Azoxystrobin-based products.",
    prevention: "Grow resistant varieties and monitor fields regularly."
  },
  {
    crop: "Corn",
    disease: "Northern Leaf Blight",
    symptoms: "Long cigar-shaped gray-green lesions appear on leaves and gradually turn brown.",
    treatment: "Remove or manage infected crop residues and use resistant varieties. Consider appropriate fungicides when necessary.",
    medicines: "Examples: Registered Azoxystrobin or Propiconazole-based products.",
    prevention: "Practice crop rotation and avoid planting susceptible hybrids repeatedly."
  },
  {
    crop: "Corn",
    disease: "Healthy",
    symptoms: "Leaves are green and free from visible rust pustules or large lesions.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Continue proper irrigation, crop monitoring and balanced nutrition."
  },
  {
    crop: "Grape",
    disease: "Black Rot",
    symptoms: "Brown circular spots appear on leaves. Fruits develop dark, shriveled, mummified areas.",
    treatment: "Remove infected berries and leaves. Prune vines to improve air circulation.",
    medicines: "Examples: Registered Mancozeb, Myclobutanil or other approved grape black-rot fungicides.",
    prevention: "Remove mummified berries and maintain clean vineyard conditions."
  },
  {
    crop: "Grape",
    disease: "Esca / Black Measles",
    symptoms: "Leaves develop yellow or reddish areas between veins. Dark spots or streaks may appear on fruits and wood.",
    treatment: "Remove severely affected vines where necessary. Prune during dry weather and protect pruning wounds.",
    medicines: "There is no reliable curative medicine for established Esca infection. Avoid unverified chemical treatments.",
    prevention: "Use healthy planting material and disinfect pruning tools between plants."
  },
  {
    crop: "Grape",
    disease: "Leaf Blight",
    symptoms: "Brown or dark spots develop on leaves. Severe infection may cause leaf drying and premature leaf fall.",
    treatment: "Remove infected leaves and improve ventilation around grapevines.",
    medicines: "Examples: Suitable registered Mancozeb or other locally approved grape leaf-disease fungicides.",
    prevention: "Avoid overhead watering and remove infected plant debris."
  },
  {
    crop: "Grape",
    disease: "Healthy",
    symptoms: "Leaves are green and normally developed without visible disease lesions.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain proper pruning, irrigation and vineyard hygiene."
  },
  {
    crop: "Orange",
    disease: "Huanglongbing / Citrus Greening",
    symptoms: "Leaves show irregular yellowing and blotchy mottling. Fruits may become small, misshapen and unevenly colored.",
    treatment: "There is no known cure for infected trees. Remove confirmed infected trees according to local agricultural guidance and control the Asian citrus psyllid vector.",
    medicines: "No medicine cures the disease. Registered insecticides may help manage psyllid populations when recommended by local authorities.",
    prevention: "Use certified disease-free nursery plants, monitor psyllids and remove infected trees."
  },
  {
    crop: "Peach",
    disease: "Bacterial Spot",
    symptoms: "Small dark spots develop on leaves and fruits. Leaf tissue may fall out, creating a shot-hole appearance.",
    treatment: "Remove heavily infected plant material and avoid wetting foliage. Maintain good orchard sanitation.",
    medicines: "Copper-based products may help protect healthy tissue in some situations, but effectiveness is limited and resistance or plant injury is possible.",
    prevention: "Use resistant varieties and healthy nursery stock."
  },
  {
    crop: "Peach",
    disease: "Healthy",
    symptoms: "Leaves are green without visible spots, holes or abnormal discoloration.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain proper pruning, watering and orchard hygiene."
  },
  {
    crop: "Bell Pepper",
    disease: "Bacterial Spot",
    symptoms: "Water-soaked spots develop on leaves and fruits. Spots may turn dark and cause leaf drop.",
    treatment: "Remove infected plants where necessary. Avoid working in wet fields and use clean seeds.",
    medicines: "Copper-based bactericides may offer limited preventive protection where locally registered. They do not cure infected plants.",
    prevention: "Use certified disease-free seeds, rotate crops and sanitize equipment."
  },
  {
    crop: "Bell Pepper",
    disease: "Healthy",
    symptoms: "Leaves are green and normal without visible bacterial spots.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Use healthy seedlings and maintain balanced watering."
  },
  {
    crop: "Potato",
    disease: "Early Blight",
    symptoms: "Brown circular leaf spots with concentric rings appear, often on older leaves.",
    treatment: "Remove infected leaves when practical, avoid plant stress and manage crop residues.",
    medicines: "Examples: Registered Mancozeb, Chlorothalonil or other approved early-blight fungicides.",
    prevention: "Practice crop rotation and maintain balanced soil nutrition."
  },
  {
    crop: "Potato",
    disease: "Late Blight",
    symptoms: "Water-soaked dark lesions develop on leaves. White fungal growth may appear under humid conditions. Tubers may rot.",
    treatment: "Remove and destroy infected plant material. Avoid moving infected tubers and follow local late-blight warnings.",
    medicines: "Examples: Registered Metalaxyl-containing combinations or other locally approved late-blight products, selected according to resistance guidance.",
    prevention: "Use certified seed potatoes, resistant varieties and avoid excessive leaf wetness."
  },
  {
    crop: "Potato",
    disease: "Healthy",
    symptoms: "Leaves are green without visible blight lesions or fungal growth.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Use healthy seed potatoes and inspect the crop regularly."
  },
  {
    crop: "Raspberry",
    disease: "Healthy",
    symptoms: "Leaves are green and normally developed without visible disease symptoms.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain proper pruning, drainage and plant spacing."
  },
  {
    crop: "Soybean",
    disease: "Healthy",
    symptoms: "Leaves are green and healthy without visible spots, yellowing or abnormal growth.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Use certified seeds and maintain proper crop rotation."
  },
  {
    crop: "Squash",
    disease: "Powdery Mildew",
    symptoms: "White powder-like patches develop on leaves and stems. Leaves may become yellow and dry.",
    treatment: "Remove severely infected leaves and improve air circulation.",
    medicines: "Examples: Sulfur-based products or other locally registered powdery mildew fungicides.",
    prevention: "Avoid overcrowding and use resistant varieties."
  },
  {
    crop: "Strawberry",
    disease: "Leaf Scorch",
    symptoms: "Small dark purple or reddish spots develop on leaves. Centers may become brown and dry.",
    treatment: "Remove infected leaves and old plant debris. Improve air circulation and avoid excessive leaf wetness.",
    medicines: "Use only a fungicide specifically registered for strawberry leaf diseases in your region, if recommended.",
    prevention: "Use disease-free planting material and maintain proper plant spacing."
  },
  {
    crop: "Strawberry",
    disease: "Healthy",
    symptoms: "Leaves are green and normally developed without visible spots or drying.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain good drainage and remove dead leaves."
  },
  {
    crop: "Tomato",
    disease: "Bacterial Spot",
    symptoms: "Small dark water-soaked spots appear on leaves and fruits. Severe infection causes leaf damage.",
    treatment: "Remove infected plant debris and avoid overhead irrigation.",
    medicines: "Copper-based bactericides may provide limited preventive protection where registered.",
    prevention: "Use healthy seeds and seedlings, rotate crops and sanitize tools."
  },
  {
    crop: "Tomato",
    disease: "Early Blight",
    symptoms: "Brown spots with concentric rings appear on older leaves. Yellowing and leaf drop may occur.",
    treatment: "Remove infected leaves and improve airflow. Avoid water splashing onto leaves.",
    medicines: "Examples: Registered Mancozeb, Chlorothalonil or other approved early-blight fungicides.",
    prevention: "Rotate crops and remove infected plant residues."
  },
  {
    crop: "Tomato",
    disease: "Late Blight",
    symptoms: "Large dark water-soaked patches appear on leaves and stems. White fungal growth may develop in humid weather.",
    treatment: "Remove infected plants or plant parts immediately and avoid moving infected material.",
    medicines: "Examples: Locally registered late-blight fungicides, including approved Metalaxyl combinations where appropriate.",
    prevention: "Use healthy seedlings, resistant varieties and proper spacing."
  },
  {
    crop: "Tomato",
    disease: "Leaf Mold",
    symptoms: "Yellow patches appear on upper leaf surfaces, with olive-green or gray mold underneath.",
    treatment: "Remove infected leaves and improve ventilation. Avoid excessive humidity.",
    medicines: "Use a locally registered fungicide recommended for tomato leaf mold, if needed.",
    prevention: "Maintain good airflow and avoid prolonged leaf wetness."
  },
  {
    crop: "Tomato",
    disease: "Septoria Leaf Spot",
    symptoms: "Numerous small circular spots with gray centers and dark borders develop on leaves.",
    treatment: "Remove infected lower leaves and plant debris. Improve airflow around plants.",
    medicines: "Examples: Registered Mancozeb or Chlorothalonil-based products where approved.",
    prevention: "Practice crop rotation and avoid overhead watering."
  },
  {
    crop: "Tomato",
    disease: "Spider Mites",
    symptoms: "Tiny yellow spots develop on leaves. Fine webbing may appear, and leaves can become dry.",
    treatment: "Wash leaves with water where practical, remove heavily infested leaves and manage weeds.",
    medicines: "Use a registered miticide only when necessary. Examples of active ingredients include Abamectin or Spiromesifen where approved.",
    prevention: "Monitor the underside of leaves and conserve beneficial predatory mites."
  },
  {
    crop: "Tomato",
    disease: "Target Spot",
    symptoms: "Brown circular leaf spots with concentric rings develop, sometimes causing leaf drop.",
    treatment: "Remove infected leaves, improve airflow and avoid overhead irrigation.",
    medicines: "Examples: Registered Azoxystrobin or other approved target-spot fungicides.",
    prevention: "Use healthy seedlings and rotate crops."
  },
  {
    crop: "Tomato",
    disease: "Tomato Yellow Leaf Curl Virus",
    symptoms: "Leaves curl upward and become yellow. Plants may become stunted with reduced fruit production.",
    treatment: "There is no direct cure for infected plants. Remove severely infected plants and control whitefly vectors.",
    medicines: "No medicine cures the virus. Registered whitefly-control products may help manage the insect vector.",
    prevention: "Use resistant varieties, insect-proof nursery practices and regular whitefly monitoring."
  },
  {
    crop: "Tomato",
    disease: "Tomato Mosaic Virus",
    symptoms: "Leaves show light and dark green mosaic patterns. Plants may become distorted and fruits may develop uneven coloring.",
    treatment: "Remove infected plants. Disinfect tools and wash hands after handling infected plants.",
    medicines: "No chemical medicine cures this virus.",
    prevention: "Use certified virus-free seeds, resistant varieties and strict sanitation."
  },
  {
    crop: "Tomato",
    disease: "Healthy",
    symptoms: "Leaves are green and normally developed without visible disease symptoms.",
    treatment: "No disease treatment is required.",
    medicines: "No medicine required.",
    prevention: "Maintain proper watering, nutrition and regular monitoring."
  }
];

function Page5() {
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const crops = ["All", ...new Set(diseases.map((item) => item.crop))];

  const filteredDiseases = useMemo(() => {
    return diseases.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.disease.toLowerCase().includes(searchText) ||
        item.crop.toLowerCase().includes(searchText) ||
        item.symptoms.toLowerCase().includes(searchText);

      const matchesCrop =
        selectedCrop === "All" || item.crop === selectedCrop;

      return matchesSearch && matchesCrop;
    });
  }, [search, selectedCrop]);

  return (
    <div className="treatment-page">
      <section className="treatment-hero">
        <span className="treatment-tag">MODULE 05 · CROP CARE</span>

        <h1>Plant Disease Treatment Guide</h1>

        <p>
          Search plant diseases and explore their symptoms, treatment
          methods, recommended medicines and prevention techniques.
        </p>

        <div className="treatment-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search disease or crop name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setExpanded(null);
            }}
          />

          {search && (
            <button onClick={() => setSearch("")}>
              Clear
            </button>
          )}
        </div>

        <div className="treatment-filters">
          <label htmlFor="crop-filter">Filter by crop:</label>

          <select
            id="crop-filter"
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              setExpanded(null);
            }}
          >
            {crops.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        <div className="treatment-count">
          Showing <strong>{filteredDiseases.length}</strong> of{" "}
          <strong>{diseases.length}</strong> disease categories
        </div>
      </section>

      <section className="treatment-results">
        {filteredDiseases.length > 0 ? (
          <div className="treatment-grid">
            {filteredDiseases.map((item, index) => {
              const isHealthy = item.disease === "Healthy";

              const cardId = `${item.crop}-${item.disease}`;

              return (
                <article
                  className="treatment-card"
                  key={cardId}
                >
                  <div className="treatment-card-top">
                    <span className="crop-badge">
                      {item.crop}
                    </span>

                    <span
                      className={
                        isHealthy
                          ? "health-badge"
                          : "disease-badge"
                      }
                    >
                      {isHealthy ? "Healthy" : "Disease"}
                    </span>
                  </div>

                  <h2>{item.disease}</h2>

                  <p className="treatment-short">
                    {item.symptoms}
                  </p>

                  <button
                    className="treatment-details-btn"
                    onClick={() =>
                      setExpanded(expanded === cardId ? null : cardId)
                    }
                  >
                    {expanded === cardId
                      ? "Hide Details ↑"
                      : "View Treatment Details →"}
                  </button>

                  {expanded === cardId && (
                    <div className="treatment-details">
                      <div>
                        <h3>🔎 Symptoms</h3>
                        <p>{item.symptoms}</p>
                      </div>

                      <div>
                        <h3>🌱 Treatment</h3>
                        <p>{item.treatment}</p>
                      </div>

                      <div>
                        <h3>💊 Recommended Medicines</h3>
                        <p>{item.medicines}</p>
                      </div>

                      <div>
                        <h3>🛡️ Prevention</h3>
                        <p>{item.prevention}</p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="no-treatment-results">
            <span>🌿</span>
            <h2>No matching disease found</h2>
            <p>
              Try searching with another disease name or crop name.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCrop("All");
              }}
            >
              Show All Diseases
            </button>
          </div>
        )}
      </section>

      <section className="treatment-disclaimer">
        <h3>⚠️ Important Agricultural Advisory</h3>
        <p>
          This guide is for educational purposes. A visual disease
          prediction is not a confirmed laboratory diagnosis. Medicines
          listed are examples of active ingredients, not prescriptions.
          Product registration and permitted uses vary by location and
          crop. Always consult a qualified agricultural expert and
          follow the product label, local regulations, protective
          equipment requirements and pre-harvest intervals before
          applying any pesticide or fungicide.
        </p>
      </section>
    </div>
  );
}

export default Page5;