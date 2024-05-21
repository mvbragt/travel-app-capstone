let postUrlGeoNames = 'http://localhost:8081/geonamesApi';
let postUrlWeatherBit = 'http://localhost:8081/weatherbitApi';
let postUrlRestCountries = 'http://localhost:8081/restCountriesApi';

// Add event listener
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleSubmit();
    });
});

// Add event listeners for save and remove buttons
document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveTrip');
    const removeButton = document.getElementById('removeTrip');

    saveButton.addEventListener('click', saveTrip);
    removeButton.addEventListener('click', removeTrip);
});

async function handleSubmit() {
    const destinationInput = document.getElementById('inputDestination').value;
    const tripStartDateInput = document.getElementById('tripStartDate').value;
    const tripEndDateInput = document.getElementById('tripEndDate').value;

    if (!destinationInput || !tripStartDateInput || !tripEndDateInput) {
        console.error('All fields are required');
        return;
    }

    try {
        console.log('Fetching GeoNames data...');
        const responseGeoNames = await fetch(postUrlGeoNames, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ destinationInput: destinationInput })
        });
        const geoData = await responseGeoNames.json();
        console.log('Received GeoNames data:', geoData);

        console.log('Fetching Weatherbit data...');
        const responseWeatherBit = await fetch(postUrlWeatherBit, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ latitude: geoData.latitude, longitude: geoData.longitude })
        });
        const weatherData = await responseWeatherBit.json();
        console.log('Received Weatherbit data:', weatherData);

        console.log('Fetching REST Countries data...');
        const responseRestCountries = await fetch(postUrlRestCountries, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ countryName: geoData.country })
        });
        const countryData = await responseRestCountries.json();
        console.log('Received REST Countries data:', countryData);

        updateUI(geoData, tripStartDateInput, tripEndDateInput, weatherData, countryData);
    } catch (error) {
        console.error('Error:', error);
        const destinationElement = document.getElementById('destination');
        if (destinationElement) {
            destinationElement.textContent = 'Failed to retrieve information. Please try again later.';
        }
    }
}

function updateUI(geoData, tripStartDate, tripEndDate, weatherData, countryData) {
    const destinationElement = document.getElementById('destination');
    const departureElement = document.getElementById('departure');
    const countdownElement = document.getElementById('countdown');
    const tripLengthElement = document.getElementById('tripLength');
    const weatherForecastElement = document.getElementById('weatherForecast');
    const countryNameElement = document.getElementById('countryName');
    const countryCapitalElement = document.getElementById('countryCapital');
    const countryRegionElement = document.getElementById('countryRegion');
    const countryPopulationElement = document.getElementById('countryPopulation');
    const countryFlagElement = document.getElementById('countryFlag');

    if (geoData.latitude && geoData.longitude && geoData.country) {
        if (destinationElement) destinationElement.textContent = `${geoData.latitude}, ${geoData.longitude}, ${geoData.country}`;

        const tripStartDateObj = new Date(tripStartDate);
        const tripEndDateObj = new Date(tripEndDate);
        const timeDiff = tripEndDateObj - tripStartDateObj;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

        if (departureElement) departureElement.textContent = tripStartDate;
        if (countdownElement) {
            if (daysDiff >= 0) {
                countdownElement.textContent = `Your trip is in ${daysDiff} days.`;
            } else {
                countdownElement.textContent = 'Your trip date has already passed.';
            }
        }
        if (tripLengthElement) tripLengthElement.textContent = `Your trip length is ${daysDiff} days.`;

        // Display the weather forecast
        if (weatherForecastElement) {
            let weatherHtml = '';
            weatherData.data.forEach(day => {
                weatherHtml += `
                    <div class="weather-day">
                        <p>${day.datetime}</p>
                        <p>High: ${day.high_temp}°C, Low: ${day.low_temp}°C</p>
                        <p>${day.weather.description}</p>
                    </div>
                `;
            });
            weatherForecastElement.innerHTML = weatherHtml;
        }

        // Display the country information
        if (countryNameElement) countryNameElement.textContent = `Country: ${countryData.name.common}`;
        if (countryCapitalElement) countryCapitalElement.textContent = `Capital: ${countryData.capital[0]}`;
        if (countryRegionElement) countryRegionElement.textContent = `Region: ${countryData.region}`;
        if (countryPopulationElement) countryPopulationElement.textContent = `Population: ${countryData.population.toLocaleString()}`;
        if (countryFlagElement) countryFlagElement.src = countryData.flags.png;
    } else {
        if (destinationElement) destinationElement.textContent = 'Destination not found. Please try another city.';
    }
}

function saveTrip() {
    const destination = document.getElementById('inputDestination').value;
    const startDate = document.getElementById('tripStartDate').value;
    const endDate = document.getElementById('tripEndDate').value;

    if (!destination || !startDate || !endDate) {
        console.error('All fields are required to save the trip');
        return;
    }

    const trip = {
        destination,
        startDate,
        endDate
    };

    let trips = JSON.parse(localStorage.getItem('trips')) || [];
    trips.push(trip);
    localStorage.setItem('trips', JSON.stringify(trips));

    console.log('Trip saved successfully', trip);
    alert('Trip saved successfully');
}

function removeTrip() {
    const destination = document.getElementById('inputDestination').value;
    const startDate = document.getElementById('tripStartDate').value;
    const endDate = document.getElementById('tripEndDate').value;

    if (!destination || !startDate || !endDate) {
        console.error('All fields are required to remove the trip');
        return;
    }

    let trips = JSON.parse(localStorage.getItem('trips')) || [];
    trips = trips.filter(trip => trip.destination !== destination || trip.startDate !== startDate || trip.endDate !== endDate);
    localStorage.setItem('trips', JSON.stringify(trips));

    console.log('Trip removed successfully');
    alert('Trip removed successfully');

    clearForm();
}

function clearForm() {
    document.getElementById('inputDestination').value = '';
    document.getElementById('tripStartDate').value = '';
    document.getElementById('tripEndDate').value = '';
    document.getElementById('destination').textContent = '';
    document.getElementById('departure').textContent = '';
    document.getElementById('tripLength').textContent = '';
    document.getElementById('weatherForecast').innerHTML = '';
    document.getElementById('countryName').textContent = '';
    document.getElementById('countryCapital').textContent = '';
    document.getElementById('countryRegion').textContent = '';
    document.getElementById('countryPopulation').textContent = '';
    document.getElementById('countryFlag').src = '';
    document.getElementById('countdown').textContent = '';
}

export { handleSubmit };
