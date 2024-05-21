const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile('dist/index.html');
});

const index = app.listen(8081, function () {
    const port = index.address().port;
    console.log("App now running on port", port);
});

// Helper function to dynamically import fetch
async function fetchWrapper(url, options) {
    const fetch = (await import('node-fetch')).default;
    return fetch(url, options);
}

// Geonames API
app.post('/geonamesApi', async (req, res) => {
    const destination = req.body.destinationInput;
    const apiKeyGeoNames = process.env.API_KEY_GEONAMES;
    const apiURL = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(destination)}&maxRows=1&username=${apiKeyGeoNames}`;
    try {
        const response = await fetchWrapper(apiURL);
        const data = await response.json();
        if (!response.ok) {
            console.error('Geonames API request failed:', data);
            res.status(500).send({ error: 'Failed to fetch data from the external API', details: data });
        } else {
            const placeInfo = data.geonames[0];
            const result = {
                latitude: placeInfo.lat,
                longitude: placeInfo.lng,
                country: placeInfo.countryName,
            };
            console.log(data);
            res.send(result);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: 'An error occurred while fetching data from the external API' });
    }
});

// Weatherbit API
app.post('/weatherbitApi', async (req, res) => {
    const { latitude, longitude } = req.body;
    const apiKeyWeatherBit = process.env.API_KEY_WEATHERBIT;
    const apiURL = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${apiKeyWeatherBit}&days=16`;
    try {
        const response = await fetchWrapper(apiURL);
        const data = await response.json();
        if (!response.ok) {
            console.error('Weatherbit API request failed:', data);
            res.status(500).send({ error: 'Failed to fetch data from the external API', details: data });
        } else {
            res.send(data);
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: 'An error occurred while fetching data from the external API' });
    }
});

// REST Countries API
app.post('/restCountriesApi', async (req, res) => {
    const { countryName } = req.body;
    const apiURL = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`;
    try {
        const response = await fetchWrapper(apiURL);
        const data = await response.json();
        if (!response.ok) {
            console.error('REST Countries API request failed:', data);
            res.status(500).send({ error: 'Failed to fetch data from the external API', details: data });
        } else {
            res.send(data[0]);  // Send the first result
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: 'An error occurred while fetching data from the external API' });
    }
});
