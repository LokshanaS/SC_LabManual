// remove old apiKey line

// 🔍 Search
async function getWeather() {
  const city = document.getElementById("city").value;

  if (!city) {
    showError("Enter a city name");
    return;
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    displayWeather(data);
    getForecast(city);

  } catch (err) {
    showError(err.message);
  }
}

// 📍 Location
function getLocationWeather() {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );

    const data = await res.json();

    displayWeather(data);
    getForecastByCoords(latitude, longitude);
  });
}

// 🌡 Display Weather
function displayWeather(data) {
  const icon = data.weather[0].icon;

  const card = document.getElementById("weatherCard");
  card.classList.remove("hidden");

  card.innerHTML = `
    <h2>${data.name}</h2>
    <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png">
    <h1>${data.main.temp}°C</h1>
    <p>${data.weather[0].description}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
  `;
}

// 📅 Forecast (city)
async function getForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();
  displayChart(data);
}

// 📅 Forecast (coords)
async function getForecastByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );

  const data = await res.json();
  displayChart(data);
}

// 📊 Chart
function displayChart(data) {
  const daily = data.list.filter(i => i.dt_txt.includes("12:00:00"));

  const labels = daily.map(d => d.dt_txt.split(" ")[0]);
  const temps = daily.map(d => d.main.temp);
  const conditions = daily.map(d => d.weather[0].description);

  const ctx = document.getElementById("forecastChart");

  if (window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature",
        data: temps,
        backgroundColor: "#013263",   //  Bar color
        borderColor: "#120002",       // Border color
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (c) =>
              temps[c.dataIndex] + "°C - " + conditions[c.dataIndex]
          }
        }
      }
    },
    plugins: [{
      id: "labels",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;

        chart.getDatasetMeta(0).data.forEach((bar, i) => {
          ctx.fillStyle = "white";
          ctx.textAlign = "center";

          ctx.fillText(temps[i] + "°C", bar.x, bar.y - 10);
          ctx.fillText(conditions[i], bar.x, bar.y + 20);
        });
      }
    }]
  });
}

// ❌ Error
function showError(msg) {
  const card = document.getElementById("weatherCard");
  card.classList.remove("hidden");

  card.innerHTML = `<p>⚠ ${msg}</p>`;
}