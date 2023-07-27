// Initialize all global variables and arrays
var today = dayjs();
var todaysTemp = $('#todays-temp');
var todaysWind = $('#todays-wind');
var todaysHumidity = $('#todays-humidity');
var lastCity = localStorage.getItem('lastCity');
var longitude = 0;
var latitude = 0;
var searchHistory = [];
var weatherEmojis = {
    '01d': '☀️', // clear sky - day
    '01n': '🌙', // clear sky - night
    '02d': '⛅', // few clouds - day
    '02n': '⛅', // few clouds - night
    '03d': '☁️', // scattered clouds - day
    '03n': '☁️', // scattered clouds - night
    '04d': '☁️', // broken clouds - day
    '04n': '☁️', // broken clouds - night
    '09d': '🌧️', // shower rain - day
    '09n': '🌧️', // shower rain - night
    '10d': '🌦️', // rain - day
    '10n': '🌦️', // rain - night
    '11d': '⛈️', // thunderstorm - day
    '11n': '⛈️', // thunderstorm - night
    '13d': '❄️', // snow - day
    '13n': '❄️', // snow - night
    '50d': '🌫️', // mist - day
    '50n': '🌫️', // mist - night
};


$(function () {
    // Sets current date and the name of the last searched city
    $('#currentCity').text(lastCity + ", " + today.format('MMM DD, YYYY'));
    // Fetches the weather forecast for the last searched city
    getWeather();

    // Gives the search button functionality
    $('#search-button').on('click', function() {
        var searchedCity = $('#searched-city').val().trim();
        if(searchedCity !== '') {
            searchHistory.push(searchedCity);
            // If the searchHistory variable has more than 8 items, shift the first one to make room for the latest city name
            if (searchHistory.length > 8) {
                searchHistory.shift();
            }
        }
        // Calls the updateButtons() function to then update the search history buttons to reflect the last searched city name
        updateButtons();
        
        getLonLad()
            .then(getWeather);
    });

    $('.btn-block').on('click', handleButtonClick);
})

// Function that fetches the geographical coordinates of whatever city the user is searching for
function getLonLad() {
    let searchedCityName = $('#searched-city').val();
    $('#currentCity').text(searchedCityName + ", " + today.format('MMM DD, YYYY'));
    localStorage.setItem('lastCity', searchedCityName);

    // Fetch the coordinates of the city the user searches
    var requestCoordinates = 'https://api.openweathermap.org/geo/1.0/direct?q=' + searchedCityName + '&limit=2&appid=de7f7524c3e1e991b9b8532504af58dd';
    return fetch(requestCoordinates)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            longitude = data[0].lon;
            latitude = data[0].lat;
        });
}

function getWeather() {
    // Fetch the city's weather forecast using the coordinates we just fetched
    var forecast = [];
    var requestCityWeather = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=imperial&cnt=56&appid=de7f7524c3e1e991b9b8532504af58dd';

    fetch(requestCityWeather)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {

            // Store forecast data for each day in the forecast array
            for (let i = 0; i < 56; i += 8) {
                forecast.push(data.list[i]);
            }

            // Update current date's information
            var currentForecast = forecast[0]; // Forecast data for the current date (index 0)
            var currentCity = localStorage.getItem('lastCity');

            if (currentForecast) {
                var formattedDate = dayjs.unix(currentForecast.dt).format('MMM DD, YYYY');
                var currentCondition = currentForecast.weather[0].icon;
                var currentConditionEmoji = weatherEmojis[currentCondition];
                $('#currentCity').text(currentCity + ', ' + formattedDate);
                $('#conditions').text(currentForecast.weather[0].description);
                $('#emoji').text(currentConditionEmoji);
                $('#todays-temp').text('Temp: ' + currentForecast.main.temp + ' °F');
                $('#todays-wind').text('Wind: ' + currentForecast.wind.speed + ' mph');
                $('#todays-humidity').text('Humidity: ' + currentForecast.main.humidity + '%');
            }

            // Loop through each element with class 'gap-1' (6-day forecast) to populate the forecast data in the HTML
            $('.gap-1').each(function (index) {
                var forecastData = forecast[index]; // Forecast data for the next 6 days (indexes 1 to 6)
                if (forecastData) {
                    var formattedDate = dayjs.unix(forecastData.dt).format('MMM DD, YYYY');
                    var weatherCondition = forecastData.weather[0].icon;
                    var conditionEmoji = weatherEmojis[weatherCondition];
                    $(this).find('.date').text(formattedDate);
                    $(this).find('.conditions').text(forecastData.weather[0].description);
                    $(this).find('.emoji').text(conditionEmoji);
                    $(this).find('.temp').text('Temp: ' + forecastData.main.temp + ' °F');
                    $(this).find('.wind').text('Wind: ' + forecastData.wind.speed + ' mph');
                    $(this).find('.humidity').text('Humidity: ' + forecastData.main.humidity + '%');
                }
            });
        })
}

// Define function to handle clicking a button in the search history
function handleButtonClick() {
    var cityName = $(this).text().trim();
    $('#searched-city').val(cityName);
    getLonLad();
    getWeather();
}

// Define function to update search history with functional buttons
function updateButtons() {
    $('.d-grid').empty();
    

    searchHistory.forEach(function (city) {
        var button = $('<button>').addClass('btn btn-secondary btn-lg btn-block').text(city);
        $('.d-grid').append(button);
    });

    $('.d-grid button').on('click', handleButtonClick);
}
