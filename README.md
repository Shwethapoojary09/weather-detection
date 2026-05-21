# Weather Detection

A fully graphical weather detection web app built with HTML, CSS, and JavaScript.

## How it works

This app detects the current weather for a city or the browser's location using the Open-Meteo APIs. It works worldwide, including cities and regions across India.

1. The user enters a city name or clicks the "Use My Location" button.
2. If a city name is entered, the app sends a request to the Open-Meteo geocoding API to convert the city name into latitude and longitude. Example searches: Mumbai, Delhi, Bengaluru, Kolkata, Chennai.
3. If the user chooses location detection, the browser requests the device's geolocation coordinates from the user.
4. Once the app has latitude and longitude, it requests current and daily weather data from the Open-Meteo weather API.
5. The app renders a graphical weather dashboard showing:
   - current temperature and weather description
   - wind speed and humidity
   - sunrise and sunset times
   - a 3-day weather outlook with daily high/low temps and icons

## Files and structure

- `index.html` — the page structure and app UI.
- `styles.css` — the full graphical design, responsive layout, and animated weather visuals.
- `script.js` — the logic for search, geolocation, API communication, and rendering results.
- `README.md` — project overview and usage instructions.

## Detailed behavior

### City search

- The user types a city name and clicks "Detect Weather" or presses Enter.
- The app calls the Open-Meteo geocoding endpoint with the city name.
- If one or more locations are returned, the first matching location is used.
- The returned latitude and longitude are then used to fetch weather details.

### Browser location detection

- The user clicks "Use My Location." 
- The browser asks permission to share the current GPS location.
- If allowed, the app receives latitude and longitude directly and requests weather data for that location.
- If denied or unavailable, the app shows an error message.

### Weather data retrieval

- The weather API request includes:
  - current weather (`current_weather=true`)
  - daily forecast data (`temperature_2m_max`, `temperature_2m_min`, `weathercode`, `sunrise`, `sunset`)
  - hourly humidity (`relativehumidity_2m`)
  - automatic timezone handling (`timezone=auto`)
- The app uses the response to build the UI cards and weather summary.

### Rendering and UI

- Current weather is displayed with a large temperature value, summary text, and a matching icon.
- Metadata cards show humidity, wind speed, sunrise, and sunset.
- A separate card displays the next 3 days of weather with daily icons and high/low temperatures.
- The interface uses a dark gradient theme, glassmorphism cards, and SVG weather icons for a polished graphical design.

## Running locally

### Open directly

Open `index.html` in a browser.

### Serve with a local server

```bash
cd /workspaces/weather-detection
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

## API details

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Weather: `https://api.open-meteo.com/v1/forecast`

No API key is required.

## Notes and limitations

- Geolocation only works in secure contexts (`https://` or `localhost`).
- The app uses browser permission prompts for location access.
- The weather dashboard is client-side only and can be extended to support more forecast details, hourly charts, or weather animations.
 - This version includes a 48-hour temperature chart (line chart) rendered with Chart.js for hourly temperature visualization.
 - Chart.js is loaded from CDN; if you want an offline copy, add the library to the project and reference it locally.

## Charts and graphs

- The app now fetches hourly temperature (`temperature_2m`) and hourly relative humidity and renders:
  - A 48-hour temperature line chart (interactive) below the 3-day outlook.
  - The chart uses `Chart.js` and displays hourly labels and temperature values.
- Files changed:
  - `index.html` — includes Chart.js CDN script
  - `script.js` — requests `temperature_2m` in hourly data and renders a line chart

### How to view charts

1. Start the local server:

```bash
cd /workspaces/weather-detection
python3 -m http.server 8000
```

2. Open `http://localhost:8000` and search for a city or use your location. The 48-hour chart will appear after weather data loads.

### Customization ideas

- Change the chart range (24 / 72 hours) by modifying the slice in `renderTempChart`.
- Add additional datasets (humidity, wind gusts) by requesting more hourly fields and adding datasets to the chart.
- Add tooltips, axis labels, and color theming via Chart.js options in `renderTempChart`.
