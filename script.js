const API_GEO = "https://geocoding-api.open-meteo.com/v1/search";
const API_WEATHER = "https://api.open-meteo.com/v1/forecast";

const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const geoButton = document.getElementById("geo-button");
const statusPanel = document.getElementById("status-panel");
const weatherGrid = document.getElementById("weather-grid");

searchButton.addEventListener("click", () => detectWeatherByCity(cityInput.value.trim()));
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") detectWeatherByCity(cityInput.value.trim());
});
geoButton.addEventListener("click", detectWeatherByLocation);

function updateStatus(message, isError = false) {
  statusPanel.innerHTML = `<p class="status-message" style="color: ${isError ? "#ffb3b3" : "var(--muted)"};">${message}</p>`;
}

function renderWeather(data, location) {
  const today = data.daily;
  const current = data.current_weather;
  const summary = getWeatherCode(current.weathercode);
  weatherGrid.innerHTML = `
    <article class="card">
      <div class="weather-summary">
        <div>
          <h2>${location.name}, ${location.country}</h2>
          <p>${summary.label}</p>
        </div>
        <div class="weather-icon" aria-label="${summary.label}">${summary.icon}</div>
      </div>
      <p class="card-strong">${Math.round(current.temperature)}°C</p>
      <div class="card-meta">
        <div class="meta-block">
          <span class="label">Humidity</span>
          <span class="value">${data.hourly_relativehumidity_2m ? data.hourly_relativehumidity_2m[0] : "—"}%</span>
        </div>
        <div class="meta-block">
          <span class="label">Wind speed</span>
          <span class="value">${current.windspeed.toFixed(1)} km/h</span>
        </div>
        <div class="meta-block">
          <span class="label">Sunrise</span>
          <span class="value">${today.sunrise[0].slice(11)}</span>
        </div>
        <div class="meta-block">
          <span class="label">Sunset</span>
          <span class="value">${today.sunset[0].slice(11)}</span>
        </div>
      </div>
    </article>
    <article class="card">
      <h2>3-Day Outlook</h2>
      ${today.time.slice(0, 3).map((day, index) => {
        const icon = getWeatherCode(today.weathercode[index]).icon;
        return `
          <div class="card-meta" style="padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <div>
              <span class="label">${new Date(day).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
              <span class="value">${Math.round(today.temperature_2m_max[index])}° / ${Math.round(today.temperature_2m_min[index])}°</span>
            </div>
            <div class="weather-icon" style="width: 48px; height: 48px;">${icon}</div>
          </div>
        `;
      }).join("")}
    </article>
    <article class="card">
      <h2>48‑Hour Temperature</h2>
      <div style="height: 220px;">
        <canvas id="temp-chart" height="160"></canvas>
      </div>
    </article>
  `;

  // render chart if hourly temp data exists
  if (data.hourly && data.hourly.temperature_2m) renderTempChart(data.hourly);
}

function getWeatherCode(code) {
  const map = {
    0: { label: "Clear sky", icon: sunIcon() },
    1: { label: "Mainly clear", icon: sunCloudIcon() },
    2: { label: "Partly cloudy", icon: sunCloudIcon() },
    3: { label: "Overcast", icon: cloudIcon() },
    45: { label: "Fog", icon: fogIcon() },
    48: { label: "Depositing rime fog", icon: fogIcon() },
    51: { label: "Light drizzle", icon: drizzleIcon() },
    53: { label: "Moderate drizzle", icon: drizzleIcon() },
    55: { label: "Dense drizzle", icon: drizzleIcon() },
    56: { label: "Light freezing drizzle", icon: drizzleIcon() },
    57: { label: "Dense freezing drizzle", icon: drizzleIcon() },
    61: { label: "Slight rain", icon: rainIcon() },
    63: { label: "Moderate rain", icon: rainIcon() },
    65: { label: "Heavy rain", icon: rainIcon() },
    66: { label: "Light freezing rain", icon: rainIcon() },
    67: { label: "Heavy freezing rain", icon: rainIcon() },
    71: { label: "Slight snow", icon: snowIcon() },
    73: { label: "Moderate snow", icon: snowIcon() },
    75: { label: "Heavy snow", icon: snowIcon() },
    77: { label: "Snow grains", icon: snowIcon() },
    80: { label: "Slight rain showers", icon: stormIcon() },
    81: { label: "Moderate rain showers", icon: stormIcon() },
    82: { label: "Violent rain showers", icon: stormIcon() },
    85: { label: "Slight snow showers", icon: snowIcon() },
    86: { label: "Heavy snow showers", icon: snowIcon() },
    95: { label: "Thunderstorm", icon: thunderIcon() },
    96: { label: "Thunderstorm with hail", icon: thunderIcon() },
    99: { label: "Thunderstorm with heavy hail", icon: thunderIcon() },
  };
  return map[code] || { label: "Unknown weather", icon: cloudIcon() };
}

function sunIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="12" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="4"><line x1="32" y1="4" x2="32" y2="16"/><line x1="32" y1="48" x2="32" y2="60"/><line x1="4" y1="32" x2="16" y2="32"/><line x1="48" y1="32" x2="60" y2="32"/><line x1="12" y1="12" x2="20" y2="20"/><line x1="44" y1="44" x2="52" y2="52"/><line x1="12" y1="52" x2="20" y2="44"/><line x1="44" y1="20" x2="52" y2="12"/></g></svg>`;
}

function cloudIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 38h30a10 10 0 0 0 0-20 13 13 0 0 0-25-3 10 10 0 1 0-5 20z" fill="currentColor"/></svg>`;
}

function sunCloudIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><circle cx="23" cy="23" r="9"/><path d="M24 40h22a8 8 0 0 0 0-16 12 12 0 0 0-23-3 8 8 0 1 0-4 16z"/></g></svg>`;
}

function rainIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 32h28a10 10 0 0 0 0-20 12 12 0 0 0-24-2 10 10 0 0 0-4 20z" fill="currentColor"/><g fill="currentColor"><path d="M26 34l-4 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M34 34l-4 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M42 34l-4 8" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></g></svg>`;
}

function drizzleIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 34h28a8 8 0 0 0 0-16 10 10 0 0 0-20-2 8 8 0 1 0-4 16z" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M26 34l-3 6"/><path d="M34 34l-3 6"/><path d="M42 34l-3 6"/></g></svg>`;
}

function snowIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 30h28a8 8 0 0 0 0-16 10 10 0 0 0-20-2 8 8 0 1 0-4 16z" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M26 36v8"/><path d="M26 40h8"/><path d="M34 36l4 8"/><path d="M42 36v8"/><path d="M42 40h-8"/></g></svg>`;
}

function thunderIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 32h28a10 10 0 0 0 0-20 12 12 0 0 0-24-2 10 10 0 1 0-4 20z" fill="currentColor"/><path d="M32 24l-6 10h8l-4 10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function fogIcon() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 32h28a8 8 0 0 0 0-16 10 10 0 0 0-20-2 8 8 0 1 0-4 16z" fill="currentColor"/><path d="M15 44h34" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M13 52h38" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M17 36h30" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`;
}

async function detectWeatherByCity(city) {
  if (!city) {
    updateStatus("Please enter a city name before searching.", true);
    return;
  }
  updateStatus(`Finding location for "${city}"...`);
  weatherGrid.innerHTML = "";

  try {
    const geo = await fetch(`${API_GEO}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geo.json();
    if (!geoData.results || geoData.results.length === 0) {
      updateStatus("No matching location found. Try another city.", true);
      return;
    }

    fetchWeather(geoData.results[0]);
  } catch (error) {
    updateStatus("Unable to find location. Check your connection and try again.", true);
    console.error(error);
  }
}

async function detectWeatherByLocation() {
  updateStatus("Detecting your current position...");
  weatherGrid.innerHTML = "";

  if (!navigator.geolocation) {
    updateStatus("Geolocation is not supported by your browser.", true);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        name: "Current location",
        country: "",
      };
      fetchWeather(coords);
    },
    (error) => {
      updateStatus("Unable to access location. Please allow location access or search manually.", true);
      console.error(error);
    },
    { timeout: 12000 }
  );
}

async function fetchWeather(location) {
  updateStatus(`Loading weather for ${location.name}...`);

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    hourly: "temperature_2m,relativehumidity_2m",
    daily: "temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset",
    current_weather: "true",
    timezone: "auto",
  });

  try {
    const response = await fetch(`${API_WEATHER}?${params}`);
    if (!response.ok) throw new Error("Weather API error");
    const data = await response.json();
    renderWeather(data, location);
    updateStatus(`Weather data loaded for ${location.name}.`);
  } catch (error) {
    updateStatus("Failed to load weather data. Try again later.", true);
    console.error(error);
  }
}

let tempChart = null;

function renderTempChart(hourly) {
  try {
    const canvas = document.getElementById('temp-chart');
    if (!canvas) return;

    const labels = (hourly.time || []).slice(0, 48).map(t => new Date(t).toLocaleString(undefined, { hour: 'numeric', month: 'short', day: 'numeric' }));
    const temps = (hourly.temperature_2m || []).slice(0, 48).map(t => Math.round(t));

    if (tempChart) {
      tempChart.destroy();
      tempChart = null;
    }

    const ctx = canvas.getContext('2d');
    tempChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: temps,
          borderColor: '#72d6ff',
          backgroundColor: 'rgba(114,214,255,0.12)',
          tension: 0.3,
          pointRadius: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: false },
          y: { beginAtZero: false }
        },
        plugins: { legend: { display: true } }
      }
    });
  } catch (e) {
    console.error('Chart render error', e);
  }
}
