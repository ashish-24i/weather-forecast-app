const apiKey = "8ed3f9088499d4a8d6065636cf60a623";

// Show current weather by city
function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const weatherDiv = document.getElementById("weatherResult");

  if (!city) {
    weatherDiv.innerHTML = `<p class="text-red-500">⚠️ Please enter a city name.</p>`;
    return;
  }

  fetchCurrentWeather(city);
  fetchForecast(city);
}

// Show weather by current location
function getCurrentLocationWeather() {
  const weatherDiv = document.getElementById("weatherResult");

  if (!navigator.geolocation) {
    weatherDiv.innerHTML = `<p class="text-red-500">❌ Geolocation not supported.</p>`;
    return;
  }

  weatherDiv.innerHTML = `<p class="text-blue-500 animate-pulse">Fetching location...</p>`;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Unable to get location weather");
          return res.json();
        })
        .then((data) => {
          displayWeather(data);
          saveToRecentCities(data.name);
          fetchForecast(data.name);
        })
        .catch((err) => {
          weatherDiv.innerHTML = `<p class="text-red-600">${err.message}</p>`;
        });
    },
    () => {
      weatherDiv.innerHTML = `<p class="text-red-500">❌ Location access denied.</p>`;
    }
  );
}

// Fetch and display current weather
function fetchCurrentWeather(city) {
  const weatherDiv = document.getElementById("weatherResult");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  weatherDiv.innerHTML = `<p class="text-blue-500 animate-pulse">Loading weather...</p>`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then((data) => {
      displayWeather(data);
      saveToRecentCities(data.name);
    })
    .catch((err) => {
      weatherDiv.innerHTML = `<p class="text-red-600">❌ ${err.message}</p>`;
    });
}

// Display weather card
function displayWeather(data) {
  const div = document.getElementById("weatherResult");
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  div.innerHTML = `
    <div class="flex flex-col items-center gap-2">
      <img src="${iconUrl}" class="w-20 h-20" />
      <h2 class="text-xl font-bold text-blue-700">${data.name}</h2>
      <p class="capitalize text-gray-700">${data.weather[0].description}</p>
      <p class="text-3xl font-bold text-blue-800">${data.main.temp}°C</p>
      <p class="text-sm text-gray-600">💧 ${data.main.humidity}% | 💨 ${data.wind.speed} m/s</p>
    </div>
  `;
}

// Save recent cities to localStorage
function saveToRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
    renderRecentCities();
  }
}

// Dropdown: recent cities
function renderRecentCities() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  const container = document.getElementById("recentSearchesContainer");
  const dropdown = document.getElementById("recentCities");

  if (cities.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  dropdown.innerHTML = `<option disabled selected>Select a city</option>`;
  cities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    dropdown.appendChild(opt);
  });
}

// Handle dropdown selection
function handleRecentCitySelection(city) {
  document.getElementById("cityInput").value = city;
  getWeather();
}

// Fetch and display 5-day forecast
function fetchForecast(city) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Forecast data not found");
      return res.json();
    })
    .then((data) => {
      const dailyMap = {};

      data.list.forEach((entry) => {
        const date = entry.dt_txt.split(" ")[0];
        if (!dailyMap[date]) dailyMap[date] = entry;
      });

      Object.values(dailyMap).slice(0, 5).forEach((day) => {
        const date = new Date(day.dt_txt).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        forecastDiv.innerHTML += `
          <div class="bg-white p-4 rounded-lg shadow text-center space-y-2">
            <p class="font-semibold">${date}</p>
            <img src="${iconUrl}" class="w-12 h-12 mx-auto" />
            <p class="text-lg font-bold">${day.main.temp}°C</p>
            <p class="text-sm text-gray-600">💧 ${day.main.humidity}% | 💨 ${day.wind.speed} m/s</p>
          </div>
        `;
      });
    })
    .catch((err) => {
      forecastDiv.innerHTML = `<p class="text-red-500 text-center">❌ ${err.message}</p>`;
    });
}

// Initialize on load
window.onload = renderRecentCities;
