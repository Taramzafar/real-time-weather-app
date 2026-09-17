// ==========================================
// GET HTML ELEMENTS
// ==========================================

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const weatherCard =
    document.getElementById("weatherCard");

const forecastContainer =
    document.getElementById("forecastContainer");

const recentSearches =
    document.getElementById("recentSearches");

const clearRecent =
    document.getElementById("clearRecent");

const windValue =
    document.getElementById("windValue");

const uvValue =
    document.getElementById("uvValue");

const humidityValue =
    document.getElementById("humidityValue");

const visibilityValue =
    document.getElementById("visibilityValue");

const mapWeatherInfo =
    document.getElementById("mapWeatherInfo");


// ==========================================
// SEARCH BUTTON
// ==========================================

searchBtn.addEventListener(
    "click",
    searchWeather
);


// ==========================================
// ENTER KEY
// ==========================================

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            searchWeather();

        }

    }
);


// ==========================================
// MAIN WEATHER FUNCTION
// ==========================================

async function searchWeather() {

    const city =
        cityInput.value.trim();


    // Check empty input

    if (city === "") {

        showError(
            "Please enter a city name."
        );

        return;

    }


    hideError();

    showLoading();


    try {

        // ======================================
        // 1. FIND CITY COORDINATES
        // ======================================

        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


        const geoResponse =
            await fetch(geoUrl);


        if (!geoResponse.ok) {

            throw new Error(
                "Unable to connect to the location service."
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "City not found. Please check the spelling and try again."
            );

        }


        const location =
            geoData.results[0];


        const latitude =
            location.latitude;


        const longitude =
            location.longitude;


        const cityName =
            location.name;


        const country =
            location.country;



        // ======================================
        // 2. GET WEATHER DATA
        // ======================================

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;


        const weatherResponse =
            await fetch(weatherUrl);


        if (!weatherResponse.ok) {

            throw new Error(
                "Unable to get weather data."
            );

        }


        const weatherData =
            await weatherResponse.json();



        // ======================================
        // 3. DISPLAY CURRENT WEATHER
        // ======================================

        displayCurrentWeather(
            cityName,
            country,
            weatherData.current
        );



        // ======================================
        // 4. DISPLAY HIGHLIGHTS
        // ======================================

        displayHighlights(
            weatherData.current
        );



        // ======================================
        // 5. DISPLAY 7 DAY FORECAST
        // ======================================

        displayForecast(
            weatherData.daily
        );



        // ======================================
        // 6. DISPLAY MAP INFO
        // ======================================

        displayMap(
            cityName,
            weatherData.current
        );



        // ======================================
        // 7. SAVE CITY
        // ======================================

        saveRecentCity(
            cityName
        );

    }


    catch (error) {

        showError(
            error.message
        );

    }


    finally {

        hideLoading();

    }

}


// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function displayCurrentWeather(
    city,
    country,
    current
) {

    const temperature =
        Math.round(
            current.temperature_2m
        );


    const feelsLike =
        Math.round(
            current.apparent_temperature
        );


    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    weatherCard.innerHTML = `

        <div class="weather-content">

            <p class="weather-location">
                📍 ${city}, ${country}
            </p>


            <div class="weather-main">

                <div class="weather-icon-large">
                    ${weatherInfo.icon}
                </div>


                <div>

                    <div class="weather-temperature">

                        ${temperature}<sup>°C</sup>

                    </div>


                    <p class="weather-description">

                        ${weatherInfo.description}

                    </p>

                </div>

            </div>


            <div class="weather-divider"></div>


            <div class="weather-meta">

                <div class="meta-item">

                    <span>🌡️</span>

                    <span>
                        Feels like ${feelsLike}°C
                    </span>

                </div>


                <div class="meta-item">

                    <span>📅</span>

                    <span>
                        Current weather
                    </span>

                </div>


                <div class="meta-item">

                    <span>🌐</span>

                    <span>
                        Live data from Open-Meteo
                    </span>

                </div>

            </div>

        </div>

    `;

}


// ==========================================
// DISPLAY HIGHLIGHTS
// ==========================================

function displayHighlights(
    current
) {

    const wind =
        Math.round(
            current.wind_speed_10m
        );


    const humidity =
        current.relative_humidity_2m;


    const uv =
        current.uv_index ?? 0;


    const visibility =
        current.visibility
            ? (current.visibility / 1000).toFixed(1)
            : "--";


    windValue.textContent =
        wind;


    uvValue.textContent =
        Number(uv).toFixed(1);


    humidityValue.textContent =
        `${humidity}%`;


    visibilityValue.textContent =
        `${visibility} km`;

}


// ==========================================
// DISPLAY 7 DAY FORECAST
// ==========================================

function displayForecast(
    daily
) {

    forecastContainer.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                daily.time[i]
            );


        const day =
            i === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );


        const formattedDate =
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "short"
                }
            );


        const max =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const min =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const item =
            document.createElement("div");


        item.className =
            "forecast-item";


        item.innerHTML = `

            <span class="forecast-day">
                ${day}
            </span>


            <span class="forecast-icon">
                ${weatherInfo.icon}
            </span>


            <span class="forecast-temp">

                ${max}°

                <span>
                    / ${min}°
                </span>

            </span>


            <span class="forecast-date">
                ${formattedDate}
            </span>

        `;


        forecastContainer.appendChild(
            item
        );

    }

}


// ==========================================
// WEATHER CODE INFORMATION
// ==========================================

function getWeatherInfo(
    code
) {

    if (code === 0) {

        return {
            icon: "☀️",
            description: "Clear Sky"
        };

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return {
            icon: "🌤️",
            description: "Partly Cloudy"
        };

    }


    if (code === 3) {

        return {
            icon: "☁️",
            description: "Overcast"
        };

    }


    if (
        code === 45 ||
        code === 48
    ) {

        return {
            icon: "🌫️",
            description: "Fog"
        };

    }


    if (
        code >= 51 &&
        code <= 67
    ) {

        return {
            icon: "🌧️",
            description: "Rainy"
        };

    }


    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            icon: "❄️",
            description: "Snow"
        };

    }


    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            icon: "🌦️",
            description: "Rain Showers"
        };

    }


    if (
        code >= 95 &&
        code <= 99
    ) {

        return {
            icon: "⛈️",
            description: "Thunderstorm"
        };

    }


    return {

        icon: "🌤️",

        description: "Weather"

    };

}


// ==========================================
// SHOW LOADING
// ==========================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

}


// ==========================================
// HIDE LOADING
// ==========================================

function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}


// ==========================================
// SHOW ERROR
// ==========================================

function showError(
    message
) {

    errorBox.textContent =
        message;


    errorBox.classList.remove(
        "hidden"
    );

}


// ==========================================
// HIDE ERROR
// ==========================================

function hideError() {

    errorBox.classList.add(
        "hidden"
    );

}


// ==========================================
// SAVE RECENT CITY
// ==========================================

function saveRecentCity(
    city
) {

    let cities =
        JSON.parse(
            localStorage.getItem(
                "recentCities"
            )
        ) || [];


    // Remove duplicate

    cities =
        cities.filter(
            function (item) {

                return (
                    item.toLowerCase()
                    !==
                    city.toLowerCase()
                );

            }
        );


    // Add newest city first

    cities.unshift(
        city
    );


    // Keep last 3

    cities =
        cities.slice(
            0,
            3
        );


    // Save

    localStorage.setItem(
        "recentCities",
        JSON.stringify(cities)
    );


    displayRecentCities();

}


// ==========================================
// DISPLAY RECENT CITIES
// ==========================================

function displayRecentCities() {

    const cities =
        JSON.parse(
            localStorage.getItem(
                "recentCities"
            )
        ) || [];


    recentSearches.innerHTML =
        "";


    cities.forEach(
        function (city) {

            const button =
                document.createElement(
                    "button"
                );


            button.textContent =
                city;


            button.className =
                "recent-btn";


            button.addEventListener(
                "click",
                function () {

                    cityInput.value =
                        city;

                    searchWeather();

                }
            );


            recentSearches.appendChild(
                button
            );

        }
    );

}


// ==========================================
// CLEAR RECENT SEARCHES
// ==========================================

clearRecent.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "recentCities"
        );

        displayRecentCities();

    }
);


// ==========================================
// LOAD SAVED SEARCHES
// ==========================================

displayRecentCities();
// ==========================================
// DISPLAY WEATHER MAP
// ==========================================

function displayMap(city, current) {

    const weatherInfo = getWeatherInfo(current.weather_code);

    mapWeatherInfo.innerHTML = `

        <span class="map-location">
            ${city}
        </span>

        <strong>
            ${weatherInfo.icon}
        </strong>

        <span>
            ${Math.round(current.temperature_2m)}°C
        </span>

    `;

}