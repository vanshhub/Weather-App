//your API key
const API_KEY = "d5bd41d49f324e8692663930252407";

//defaultcity when intial page load
let currentCity = "mumbai";

//to store forecast days for card clicks
let forecastDataCache = [];

// function for  [(0),(today)] or [(1),(Tomorrow)]
function updateSingleDayForecast(dayIndex, label) {
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${currentCity}&days=2`)
    .then(res => res.json())
    .then(data => {
      const forecastDay = data.forecast.forecastday[dayIndex];
      const location = data.location;
      const current = data.current;

      const date = new Date(forecastDay.date);
      const dayName = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      // Update left icon
      const condition = forecastDay.day.condition.text;
      const mainIcon = getCustomIcon(condition);
      const mainImg = document.getElementById("main-weather-icon");
      if (mainImg) {
        mainImg.src = mainIcon;
        mainImg.alt = condition;
      }

      // Left section info
      document.getElementById("current-date").textContent = `${label}, ${dayName}`;
      document.getElementById("location").textContent = `${location.name}, ${location.region}`;
      document.getElementById("temperature").textContent = dayIndex === 0
        ? `${Math.round(current.temp_c)}°C`
        : `${Math.round(current.temp_c)}°C`;
      document.getElementById("humidity").textContent = `${forecastDay.day.avghumidity}%`;
      document.getElementById("wind").textContent = `${forecastDay.day.maxwind_kph} km/h`;
      document.getElementById("precipitation").textContent = `${forecastDay.day.daily_chance_of_rain}%`;
      document.getElementById("sunrise-time").textContent = forecastDay.astro.sunrise;
      document.getElementById("sunset-time").textContent = forecastDay.astro.sunset;
      // document.getElementById("sunrisetime").textContent = forecastDay.

      // Header info
      document.getElementById("headermonth").textContent = date.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
      });
      document.getElementById("headerday").textContent = date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      //  Only show the first forecast card and hide the rest
      const allCards = document.querySelectorAll(".alldays");
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        if (i === 0) {
          const iconUrl = getCustomIcon(condition);
          card.style.display = "block";
          card.querySelector("p").textContent = date.toLocaleDateString("en-IN", { weekday: "long" });
          card.querySelector("img").src = iconUrl;
          card.querySelector("img").alt = condition;
          card.querySelector("h3").textContent = `${Math.round(current.temp_c)}°`; // or temp_c if you want current
        }
        else {
          card.style.display = "none";
        }
      }
    })
    .catch(err => console.error(`Failed to fetch ${label.toLowerCase()} data:`, err));
}

// Returns the correct image path based on weather condition string (like "Cloudy", "Sunny")
function getCustomIcon(condition) {
  condition = condition.toLowerCase();

  if (condition.includes("partly cloudy")) return "images/partly_cloudy.png";
  if (condition.includes("cloud")) return "images/partly_cloudy.png";
  if (condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) return "images/Rain_storm.png";
  if (condition.includes("snow")) return "images/snowy.png";
  if (condition.includes("sunny") || condition.includes("clear")) return "images/slight_touch_happyday.png";

  return "IMAGES/partly_cloudy.png"; // fallback
}
//Called when "Next 7 Days" button is clicked
function updateNext7DaysForecast() {
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${currentCity}&days=7`)
    .then(res => res.json())
    .then(data => {
      const forecastDays = data.forecast.forecastday;
      const allCards = document.querySelectorAll(".alldays");
      forecastDataCache = forecastDays;
      setupForecastCardClicks();

      for (let i = 1; i < forecastDays.length && i - 1 < allCards.length; i++) {
        const dayData = forecastDays[i]; // i=1 means skip today
        const card = allCards[i - 1];    // shift index back to 0 for cards

        const date = new Date(dayData.date);
        const dayName = date.toLocaleDateString("en-IN", { weekday: "long" });
        const temp = Math.round(dayData.day.avgtemp_c);
        const condition = dayData.day.condition.text;
        const iconUrl = getCustomIcon(condition);

        card.style.display = "block"; // ensure visible
        card.querySelector("p").textContent = dayName;
        card.querySelector("img").src = iconUrl;
        card.querySelector("img").alt = condition;
        card.querySelector("h3").textContent = `${temp}°`;
      }

      // Hide unused cards if any
      for (let j = forecastDays.length - 1; j < allCards.length; j++) {
        allCards[j].style.display = "none";
      }
    })
    .catch(err => console.error("Failed to fetch 7-day forecast:", err));
}
// Called when user searches a city
// Updates the left section (Today) and cards (next 5 days)
function searchCityWeather(city) {
  currentCity = city;
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${currentCity}&days=6`)
    .then(res => res.json())
    .then(data => {
      const forecastDays = data.forecast.forecastday;
      const location = data.location;
      const current = data.current;
      forecastDataCache = forecastDays;
      setupForecastCardClicks();

      // Update Left Section for Today
      const today = forecastDays[0];
      const condition = today.day.condition.text;
      const date = new Date(today.date);
      const icon = getCustomIcon(condition);

      document.getElementById("main-weather-icon").src = icon;
      document.getElementById("main-weather-icon").alt = condition;
      document.getElementById("location").textContent = `${location.name}, ${location.region}`;
      document.getElementById("current-date").textContent = `Today, ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      document.getElementById("temperature").textContent = `${Math.round(current.temp_c)}°C`;
      document.getElementById("humidity").textContent = `${current.humidity}%`;
      document.getElementById("wind").textContent = `${current.wind_kph} km/h`;
      document.getElementById("precipitation").textContent = `${today.day.daily_chance_of_rain}%`;
      document.getElementById("sunrise-time").textContent = today.astro.sunrise;
      document.getElementById("sunset-time").textContent = today.astro.sunset;
      document.getElementById("sunriseTime").textContent = getTimeDifferenceLabel(today.astro.sunrise, location.localtime);
      document.getElementById("sunsetTime").textContent = getTimeDifferenceLabel(today.astro.sunset, location.localtime);

      document.getElementById("headermonth").textContent = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      document.getElementById("headerday").textContent = date.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });



      //  Update Forecast Cards for Next 5 Days
      const allCards = document.querySelectorAll(".alldays");
      for (let i = 1; i < forecastDays.length && i - 1 < allCards.length; i++) {
        const day = forecastDays[i];
        const card = allCards[i - 1];

        const cardDate = new Date(day.date);
        const dayName = cardDate.toLocaleDateString("en-IN", { weekday: "long" });
        const temp = Math.round(day.day.avgtemp_c);
        const cardCondition = day.day.condition.text;
        const cardIcon = getCustomIcon(cardCondition);

        card.style.display = "block";
        card.querySelector("p").textContent = dayName;
        card.querySelector("img").src = cardIcon;
        card.querySelector("img").alt = cardCondition;
        card.querySelector("h3").textContent = `${temp}°`;
      }

      // Hide extra cards if any
      for (let j = forecastDays.length - 1; j < allCards.length; j++) {
        allCards[j].style.display = "none";
      }
    })
    .catch(err => {
      console.error("Search failed:", err);
      alert("City not found. Please try another name.");
    });
}

// Clicking on a card (e.g., Friday) shows full info in left section
function setupForecastCardClicks() {
  const cards = document.querySelectorAll(".alldays");
  cards.forEach((card, index) => {
    card.setAttribute("data-index", index + 1); // index+1 because 0 is today
    card.addEventListener("click", () => {
      if (forecastDataCache.length > index + 1) {
        const selectedDay = forecastDataCache[index + 1];
        showDetailedForecast(selectedDay);
        scrollToLeftSectionIfMobile(); // <-- Add this line
      }
    });
  });
}


// Called when a forecast card is clicked
// Shows full weather info for that day in left panel
function showDetailedForecast(dayData) {
  const date = new Date(dayData.date);
  const condition = dayData.day.condition.text;
  const icon = getCustomIcon(condition);

  document.getElementById("main-weather-icon").src = icon;
  document.getElementById("main-weather-icon").alt = condition;
  document.getElementById("current-date").textContent = date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
  document.getElementById("temperature").textContent = `${Math.round(dayData.day.avgtemp_c)}°C`;
  document.getElementById("humidity").textContent = `${dayData.day.avghumidity}%`;
  document.getElementById("wind").textContent = `${dayData.day.maxwind_kph} km/h`;
  document.getElementById("precipitation").textContent = `${dayData.day.daily_chance_of_rain}%`;
  document.getElementById("sunrise-time").textContent = dayData.astro.sunrise;
  document.getElementById("sunset-time").textContent = dayData.astro.sunset;
  document.getElementById("sunriseTime").textContent = getTimeDifferenceLabel(dayData.astro.sunrise, location.localtime);
  document.getElementById("sunsetTime").textContent = getTimeDifferenceLabel(dayData.astro.sunset, location.localtime);


  document.getElementById("headermonth").textContent = date.toLocaleDateString("en-IN", {
    month: "long", year: "numeric"
  });
  document.getElementById("headerday").textContent = date.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

}

// Returns a label like "2 hours ago" or "in 3 hours"
// Used for sunriseTime/sunsetTime display
function getTimeDifferenceLabel(timeStr, locationTime) {
  const [hourMin, ampm] = timeStr.split(" ");
  let [hour, minute] = hourMin.split(":").map(Number);

  if (ampm.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;

  const current = new Date(locationTime);
  const eventTime = new Date(locationTime);
  eventTime.setHours(hour, minute, 0, 0);

  const diffMs = current - eventTime;
  const diffHrs = Math.round(Math.abs(diffMs) / (1000 * 60 * 60));

  if (diffMs > 0) return `${diffHrs} hours ago`;
  else return `in ${diffHrs} hours`;
}
function updateCityCards() {
  const cards = document.querySelectorAll(".city-card");

  cards.forEach((card) => {
    const city = card.getAttribute("data-city");

    // Must include days=1 to get astro data (sunrise/sunset)
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=1`)
      .then(res => res.json())
      .then(data => {
        const condition = data.current.condition.text;
        const icon = getCustomIcon(condition);

        // Update text and icon
        card.querySelector("h3").innerHTML = `${data.location.name}<br><span>${condition}</span>`;
        card.querySelector("img").src = icon;
        card.querySelector("img").alt = condition;
        card.querySelector("h2").textContent = `${Math.round(data.current.temp_c)}°`;

        // ✅ This triggers left panel to show sunrise/sunset etc.
        card.addEventListener("click", () => {
          showLeftPanel(data);  // this uses forecast.astro.sunrise/sunset
        });
      })
      .catch(err => console.error(`Card error [${city}]:`, err));
  });
}


//this shows info in left panel when card is clicked 
function showLeftPanel(data) {
  const location = data.location;
  const current = data.current;
  const forecast = data.forecast.forecastday[0]; // ✅ Needed for astro.sunrise/sunset

  // Get the correct local icon
  const icon = getCustomIcon(current.condition.text);

  // Update icon and condition
  document.getElementById("main-weather-icon").src = icon;
  document.getElementById("main-weather-icon").alt = current.condition.text;

  // Update city and date
  const date = new Date(location.localtime);
  document.getElementById("location").textContent = `${location.name}, ${location.region}`;
  document.getElementById("current-date").textContent = `Today, ${date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })}`;

  // Update weather data
  document.getElementById("temperature").textContent = `${Math.round(current.temp_c)}°C`;
  document.getElementById("humidity").textContent = `${current.humidity}%`;
  document.getElementById("wind").textContent = `${current.wind_kph} km/h`;
  document.getElementById("precipitation").textContent = `${forecast.day.daily_chance_of_rain || '--'}%`;

  //  Correctly get sunrise/sunset from forecast
  document.getElementById("sunrise-time").textContent = forecast.astro.sunrise;
  document.getElementById("sunset-time").textContent = forecast.astro.sunset;
  document.getElementById("sunriseTime").textContent = getTimeDifferenceLabel(forecast.astro.sunrise, location.localtime);
  document.getElementById("sunsetTime").textContent = getTimeDifferenceLabel(forecast.astro.sunset, location.localtime);

  // Update headers
  document.getElementById("headermonth").textContent = date.toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  });
  document.getElementById("headerday").textContent = date.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  scrollToLeftSectionIfMobile();
}

function scrollToLeftSectionIfMobile() {
  if (window.innerWidth <= 768) {
    document.activeElement.blur(); // Close keyboard

    setTimeout(() => {
      const leftSection = document.querySelector(".left-section");

      if (leftSection) {
        // Step 1: Try scrollIntoView
        leftSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        // Step 2: Hard fallback for iOS/Android layout quirks
        const topOffset = leftSection.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({
          top: topOffset,
          behavior: "smooth"
        });
      }
    }, 300); // Wait for DOM + keyboard to settle
  }
}



// Event Listener
document.getElementById("todayBtn").addEventListener("click", () => {
  updateSingleDayForecast(0, "Today");
  scrollToLeftSectionIfMobile();
});

document.getElementById("tomorrowBtn").addEventListener("click", () => {
  updateSingleDayForecast(1, "Tomorrow");
  scrollToLeftSectionIfMobile();
});
document.getElementById("next7Btn").addEventListener("click", updateNext7DaysForecast);

// Event listener when location is added and then pressed enter button
document.getElementById("search-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const city = e.target.value.trim();
    if (city) {
      searchCityWeather(city, scrollToLeftSectionIfMobile);
    } else {
      alert("Please enter a city name."); // ✅ only if input is empty
    }
  }
});



//by default current weather loadon page start
window.addEventListener("load", () => {
  searchCityWeather(currentCity);
  updateCityCards();
});
