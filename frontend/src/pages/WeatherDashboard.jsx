import { useCallback, useEffect, useState } from "react";
import "./WeatherDashboard.css";

const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

const DEFAULT_LOCATION = {
  name: "Bardhaman",
  admin1: "West Bengal",
  country: "India",
  latitude: 23.2324,
  longitude: 87.8615,
};

const WEATHER_CODES = {
  0: { text: "Clear sky", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤️" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫️" },
  48: { text: "Depositing rime fog", icon: "🌫️" },
  51: { text: "Light drizzle", icon: "🌦️" },
  53: { text: "Moderate drizzle", icon: "🌦️" },
  55: { text: "Dense drizzle", icon: "🌧️" },
  61: { text: "Slight rain", icon: "🌦️" },
  63: { text: "Moderate rain", icon: "🌧️" },
  65: { text: "Heavy rain", icon: "🌧️" },
  71: { text: "Slight snowfall", icon: "🌨️" },
  73: { text: "Moderate snowfall", icon: "🌨️" },
  75: { text: "Heavy snowfall", icon: "❄️" },
  80: { text: "Rain showers", icon: "🌦️" },
  81: { text: "Moderate rain showers", icon: "🌧️" },
  82: { text: "Violent rain showers", icon: "⛈️" },
  85: { text: "Snow showers", icon: "🌨️" },
  86: { text: "Heavy snow showers", icon: "❄️" },
  95: { text: "Thunderstorm", icon: "⛈️" },
  96: { text: "Thunderstorm with hail", icon: "⛈️" },
  99: { text: "Severe thunderstorm with hail", icon: "⛈️" },
};

function getWeather(code) {
  return (
    WEATHER_CODES[code] || {
      text: "Weather information unavailable",
      icon: "🌤️",
    }
  );
}

function formatTime(value) {
  if (!value) return "--";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDay(value, options = {}) {
  if (!value) return "--";

  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      ...options,
    }
  );
}

function MetricCard({ icon, label, value, unit, description }) {
  return (
    <article className="weather-metric-card">
      <div className="weather-metric-icon">{icon}</div>

      <div className="weather-metric-label">{label}</div>

      <div className="weather-metric-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>

      {description && (
        <div className="weather-metric-description">
          {description}
        </div>
      )}
    </article>
  );
}

function WeatherDashboard() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // --------------------------------------------------
  // LOAD WEATHER DATA
  // --------------------------------------------------

  const loadWeather = useCallback(
    async (selectedLocation = location, showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const params = new URLSearchParams({
          latitude: String(selectedLocation.latitude),
          longitude: String(selectedLocation.longitude),

          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "cloud_cover",
            "pressure_msl",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "is_day",
          ].join(","),

          hourly: [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation_probability",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
            "soil_temperature_0cm",
            "soil_moisture_0_to_7cm",
            "et0_fao_evapotranspiration",
            "uv_index",
          ].join(","),

          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "sunrise",
            "sunset",
            "uv_index_max",
            "et0_fao_evapotranspiration",
          ].join(","),

          timezone: "auto",
          forecast_days: "7",
          wind_speed_unit: "kmh",
          precipitation_unit: "mm",
          temperature_unit: "celsius",
        });

        const response = await fetch(
          `${FORECAST_API}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Weather service returned ${response.status}.`
          );
        }

        const data = await response.json();

        if (!data.current || !data.daily || !data.hourly) {
          throw new Error(
            "The weather service returned incomplete data."
          );
        }

        setWeather(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(
          err.message ||
            "Unable to load weather information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

  // Initial load and refresh every 15 minutes.
  useEffect(() => {
    loadWeather(location, true);

    const interval = setInterval(() => {
      loadWeather(location, false);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [location, loadWeather]);

  // --------------------------------------------------
  // SEARCH LOCATIONS
  // --------------------------------------------------

  async function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      setError("Please enter a city or location.");
      return;
    }

    setSearching(true);
    setError("");
    setSuggestions([]);

    try {
      const params = new URLSearchParams({
        name: query,
        count: "6",
        language: "en",
        format: "json",
      });

      const response = await fetch(
        `${GEOCODING_API}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Unable to search for this location.");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(
          "Location not found. Try another city name."
        );
      }

      if (data.results.length === 1) {
        chooseLocation(data.results[0]);
      } else {
        setSuggestions(data.results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  function chooseLocation(item) {
    const selectedLocation = {
      name: item.name,
      admin1: item.admin1 || "",
      country: item.country || "",
      latitude: item.latitude,
      longitude: item.longitude,
    };

    setLocation(selectedLocation);
    setSearchText("");
    setSuggestions([]);
    setWeather(null);
    setLoading(true);
  }

  // --------------------------------------------------
  // AGRICULTURAL INSIGHTS
  // --------------------------------------------------

  function getFarmingInsights(data) {
    if (!data) return [];

    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    const insights = [];

    const temperature = current.temperature_2m;
    const humidity = current.relative_humidity_2m;

    const nextHours = hourly.time
      .map((time, index) => ({
        time,
        probability:
          hourly.precipitation_probability?.[index] ?? 0,
        rain: hourly.precipitation?.[index] ?? 0,
      }))
      .filter((item) => {
        return (
          new Date(item.time).getTime() >=
          new Date(current.time).getTime()
        );
      })
      .slice(0, 12);

    const likelyRain = nextHours.some(
      (item) => item.probability >= 60 || item.rain >= 2
    );

    const maxWind = Math.max(
      0,
      ...nextHours.map((item) => {
        const index = hourly.time.indexOf(item.time);
        return hourly.wind_speed_10m?.[index] ?? 0;
      })
    );

    if (temperature >= 35) {
      insights.push({
        icon: "🌡️",
        title: "Heat stress watch",
        text:
          "Temperatures are high. Check crop-specific heat stress, soil moisture, and irrigation requirements.",
        type: "warning",
      });
    } else if (temperature <= 10) {
      insights.push({
        icon: "❄️",
        title: "Cool weather",
        text:
          "Check whether the temperature is suitable for your crop and its current growth stage.",
        type: "info",
      });
    } else {
      insights.push({
        icon: "🌱",
        title: "Temperature monitoring",
        text:
          "Compare the current temperature with your crop's preferred growing range.",
        type: "good",
      });
    }

    if (likelyRain) {
      insights.push({
        icon: "🌧️",
        title: "Rainfall watch",
        text:
          "Rain is possible in the coming hours. Check the forecast before irrigating or applying crop sprays.",
        type: "warning",
      });
    } else {
      insights.push({
        icon: "💧",
        title: "Irrigation planning",
        text:
          "No strong rainfall signal was detected in the next 12 hours. Check root-zone moisture before deciding whether to irrigate.",
        type: "info",
      });
    }

    if (maxWind >= 25) {
      insights.push({
        icon: "💨",
        title: "Wind advisory",
        text:
          "Strong winds may affect spraying and field operations. Check local conditions before working.",
        type: "warning",
      });
    }

    if (humidity >= 85) {
      insights.push({
        icon: "🍃",
        title: "High humidity",
        text:
          "Conditions are humid. Monitor crops for disease symptoms, especially where leaf wetness persists.",
        type: "info",
      });
    }

    const todayET0 = daily.et0_fao_evapotranspiration?.[0];

    if (todayET0 != null) {
      insights.push({
        icon: "🌿",
        title: "Reference evapotranspiration",
        text:
          `Today's reference ET₀ is approximately ${todayET0.toFixed(1)} mm. ` +
          "Use crop coefficients and soil moisture to estimate crop irrigation needs.",
        type: "info",
      });
    }

    return insights;
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;

  const currentWeather = getWeather(current?.weather_code);

  const hourlyForecast = hourly
    ? hourly.time
        .map((time, index) => ({
          time,
          temperature: hourly.temperature_2m[index],
          probability:
            hourly.precipitation_probability?.[index],
          rain: hourly.precipitation?.[index],
          code: hourly.weather_code[index],
        }))
        .filter(
          (item) =>
            new Date(item.time).getTime() >=
            new Date(current.time).getTime()
        )
        .slice(0, 24)
    : [];

  const farmingInsights = getFarmingInsights(weather);

  return (
    <main className="weather-dashboard">
      {/* HEADER */}
      <section className="weather-page-header">
        <div>
          <div className="weather-eyebrow">
            🌱 CROPSENSE INTELLIGENCE
          </div>

          <h1>Weather Intelligence</h1>

          <p>
            Understand your local weather, plan field activities,
            and make better-informed farming decisions.
          </p>
        </div>

        <div className="weather-header-badge">
          <span>●</span> Live forecast
        </div>
      </section>

      {/* LOCATION SEARCH */}
      <section className="weather-search-panel">
        <form onSubmit={handleSearch} className="weather-search-form">
          <div className="weather-search-input">
            <span>📍</span>

            <input
              type="text"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              placeholder="Search city, town, or farming location"
              aria-label="Search weather location"
            />
          </div>

          <button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search Location"}
          </button>
        </form>

        <div className="weather-location-current">
          <span>Current location:</span>

          <strong>
            {location.name}
            {location.admin1 ? `, ${location.admin1}` : ""}
            {location.country ? `, ${location.country}` : ""}
          </strong>

          <button
            type="button"
            onClick={() => loadWeather(location, true)}
          >
            ↻ Refresh
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="weather-location-suggestions">
            {suggestions.map((item, index) => (
              <button
                type="button"
                key={`${item.latitude}-${item.longitude}-${index}`}
                onClick={() => chooseLocation(item)}
              >
                <strong>{item.name}</strong>
                <span>
                  {[item.admin1, item.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ERROR */}
      {error && (
        <div className="weather-error" role="alert">
          <span>⚠️</span>
          <span>{error}</span>

          <button
            type="button"
            onClick={() => loadWeather(location, true)}
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && !weather && (
        <section className="weather-loading">
          <div className="weather-spinner" />
          <h2>Loading weather intelligence...</h2>
          <p>Fetching the latest available forecast.</p>
        </section>
      )}

      {/* WEATHER CONTENT */}
      {weather && (
        <>
          {/* CURRENT WEATHER */}
          <section className="weather-hero">
            <div className="weather-hero-main">
              <div className="weather-hero-location">
                <span>📍</span>

                {location.name}
                {location.admin1 ? `, ${location.admin1}` : ""}
              </div>

              <div className="weather-current-layout">
                <div>
                  <div className="weather-condition-icon">
                    {currentWeather.icon}
                  </div>

                  <div className="weather-condition-text">
                    {currentWeather.text}
                  </div>
                </div>

                <div className="weather-temperature">
                  {Math.round(current.temperature_2m)}
                  <span>°C</span>
                </div>
              </div>

              <p className="weather-feels-like">
                Feels like {Math.round(current.apparent_temperature)}°C
              </p>

              <div className="weather-current-summary">
                <span>
                  💧 Humidity: {current.relative_humidity_2m}%
                </span>

                <span>
                  💨 Wind: {current.wind_speed_10m} km/h
                </span>

                <span>
                  🌧️ Precipitation: {current.precipitation} mm
                </span>
              </div>
            </div>

            <div className="weather-hero-side">
              <div className="weather-side-label">
                WEATHER OVERVIEW
              </div>

              <div className="weather-side-row">
                <span>☁️ Cloud cover</span>
                <strong>{current.cloud_cover}%</strong>
              </div>

              <div className="weather-side-row">
                <span>🧭 Wind direction</span>
                <strong>{current.wind_direction_10m}°</strong>
              </div>

              <div className="weather-side-row">
                <span>💨 Wind gusts</span>
                <strong>{current.wind_gusts_10m} km/h</strong>
              </div>

              <div className="weather-side-row">
                <span>🌡️ Pressure</span>
                <strong>{current.pressure_msl} hPa</strong>
              </div>

              <div className="weather-side-row">
                <span>🕒 Local weather time</span>
                <strong>{formatTime(current.time)}</strong>
              </div>

              <div className="weather-updated">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      }
                    )}`
                  : "Waiting for update"}
              </div>
            </div>
          </section>

          {/* AGRICULTURAL METRICS */}
          <section className="weather-section">
            <div className="weather-section-heading">
              <div>
                <div className="weather-section-label">
                  FARM ENVIRONMENT
                </div>

                <h2>Today's Agricultural Conditions</h2>

                <p>
                  Weather indicators relevant to irrigation,
                  crop monitoring, and field planning.
                </p>
              </div>
            </div>

            <div className="weather-metrics-grid">
              <MetricCard
                icon="🌡️"
                label="Air Temperature"
                value={current.temperature_2m}
                unit="°C"
                description="Current air temperature"
              />

              <MetricCard
                icon="💧"
                label="Relative Humidity"
                value={current.relative_humidity_2m}
                unit="%"
                description="Moisture in the air"
              />

              <MetricCard
                icon="🌱"
                label="Surface Soil Temperature"
                value={hourly.soil_temperature_0cm?.[0] ?? "--"}
                unit={
                  hourly.soil_temperature_0cm?.[0] != null
                    ? "°C"
                    : ""
                }
                description="Modelled soil temperature"
              />

              <MetricCard
                icon="💦"
                label="Surface Soil Moisture"
                value={
                  hourly.soil_moisture_0_to_7cm?.[0] != null
                    ? (
                        hourly.soil_moisture_0_to_7cm[0] * 100
                      ).toFixed(1)
                    : "--"
                }
                unit={
                  hourly.soil_moisture_0_to_7cm?.[0] != null
                    ? "%"
                    : ""
                }
                description="Volumetric water content, top 7 cm"
              />

              <MetricCard
                icon="☀️"
                label="UV Index"
                value={hourly.uv_index?.[0] ?? "--"}
                description="Forecast UV index"
              />

              <MetricCard
                icon="🌿"
                label="Reference ET₀"
                value={
                  daily.et0_fao_evapotranspiration?.[0] != null
                    ? daily.et0_fao_evapotranspiration[0].toFixed(1)
                    : "--"
                }
                unit={
                  daily.et0_fao_evapotranspiration?.[0] != null
                    ? " mm"
                    : ""
                }
                description="Estimated daily reference evapotranspiration"
              />
            </div>

            <p className="weather-data-note">
              Soil values are weather-model estimates for the selected
              coordinates, not direct measurements from your farm.
              Reference ET₀ is not the same as actual crop water use.
            </p>
          </section>

          {/* HOURLY FORECAST */}
          <section className="weather-section">
            <div className="weather-section-heading">
              <div>
                <div className="weather-section-label">
                  NEXT 24 HOURS
                </div>

                <h2>Hourly Weather Forecast</h2>

                <p>
                  Track changing temperature, rain probability,
                  and expected rainfall throughout the day.
                </p>
              </div>
            </div>

            <div className="weather-hourly-scroll">
              {hourlyForecast.map((item) => {
                const condition = getWeather(item.code);

                return (
                  <article
                    className="weather-hourly-card"
                    key={item.time}
                  >
                    <div className="weather-hourly-time">
                      {formatTime(item.time)}
                    </div>

                    <div className="weather-hourly-icon">
                      {condition.icon}
                    </div>

                    <div className="weather-hourly-temp">
                      {Math.round(item.temperature)}°
                    </div>

                    <div className="weather-hourly-rain">
                      💧 {item.probability ?? "--"}%
                    </div>

                    <div className="weather-hourly-mm">
                      {Number(item.rain ?? 0).toFixed(1)} mm
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* SEVEN-DAY FORECAST */}
          <section className="weather-section">
            <div className="weather-section-heading">
              <div>
                <div className="weather-section-label">
                  PLAN AHEAD
                </div>

                <h2>7-Day Weather Forecast</h2>

                <p>
                  Review expected temperatures, rainfall, and wind
                  before planning field activities.
                </p>
              </div>
            </div>

            <div className="weather-daily-list">
              {daily.time.map((day, index) => {
                const condition = getWeather(
                  daily.weather_code[index]
                );

                return (
                  <article
                    className="weather-daily-row"
                    key={day}
                  >
                    <div className="weather-daily-day">
                      <strong>
                        {index === 0
                          ? "Today"
                          : formatDay(day)}
                      </strong>

                      <span>{condition.text}</span>
                    </div>

                    <div className="weather-daily-icon">
                      {condition.icon}
                    </div>

                    <div className="weather-daily-temperature">
                      <span>
                        {Math.round(
                          daily.temperature_2m_min[index]
                        )}°
                      </span>

                      <div className="weather-temperature-range">
                        <div
                          className="weather-temperature-range-fill"
                          style={{
                            width: `${
                              Math.max(
                                12,
                                Math.min(
                                  100,
                                  ((daily.temperature_2m_max[index] -
                                    daily.temperature_2m_min[index]) /
                                    20) *
                                    100
                                )
                              )
                            }%`,
                          }}
                        />
                      </div>

                      <strong>
                        {Math.round(
                          daily.temperature_2m_max[index]
                        )}°
                      </strong>
                    </div>

                    <div className="weather-daily-rain">
                      <span>🌧️</span>

                      <strong>
                        {daily.precipitation_probability_max?.[
                          index
                        ] ?? "--"}%
                      </strong>

                      <small>
                        {Number(
                          daily.precipitation_sum[index] ?? 0
                        ).toFixed(1)}{" "}
                        mm
                      </small>
                    </div>

                    <div className="weather-daily-wind">
                      💨{" "}
                      {Math.round(
                        daily.wind_speed_10m_max[index]
                      )}{" "}
                      km/h
                    </div>

                    <div className="weather-daily-uv">
                      UV{" "}
                      {daily.uv_index_max?.[index] ?? "--"}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* SUNRISE / SUNSET */}
          <section className="weather-section">
            <div className="weather-section-heading">
              <div>
                <div className="weather-section-label">
                  DAYLIGHT
                </div>

                <h2>Sunrise & Sunset</h2>
              </div>
            </div>

            <div className="weather-sun-grid">
              <div className="weather-sun-card">
                <span>🌅</span>

                <div>
                  <small>Sunrise</small>
                  <strong>{formatTime(daily.sunrise?.[0])}</strong>
                </div>
              </div>

              <div className="weather-sun-card">
                <span>🌇</span>

                <div>
                  <small>Sunset</small>
                  <strong>{formatTime(daily.sunset?.[0])}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* FARMING INSIGHTS */}
          <section className="weather-section">
            <div className="weather-section-heading">
              <div>
                <div className="weather-section-label">
                  SMART FARMING
                </div>

                <h2>Farming Weather Insights</h2>

                <p>
                  General recommendations based on current
                  conditions and the upcoming forecast.
                </p>
              </div>
            </div>

            <div className="weather-insights-grid">
              {farmingInsights.map((insight, index) => (
                <article
                  className={`weather-insight-card ${insight.type}`}
                  key={`${insight.title}-${index}`}
                >
                  <div className="weather-insight-icon">
                    {insight.icon}
                  </div>

                  <div>
                    <h3>{insight.title}</h3>
                    <p>{insight.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <p className="weather-disclaimer">
              These insights are general weather-based guidance,
              not guaranteed agronomic recommendations. Verify
              local conditions and crop-specific requirements
              before making irrigation, spraying, or other
              field-management decisions.
            </p>
          </section>
        </>
      )}

      <footer className="weather-footer">
        <span>🌱 CropSense Weather Intelligence</span>

        <span>
          Weather data: Open-Meteo ·{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
          >
            Data source and attribution
          </a>
        </span>
      </footer>
    </main>
  );
}

export default WeatherDashboard;