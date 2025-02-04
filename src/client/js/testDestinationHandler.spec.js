// src/client/js/testDestinationHandler.spec.js
import { handleSubmit } from './destinationHandler';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent } from '@testing-library/dom';
import fetchMock from 'jest-fetch-mock';


fetchMock.enableMocks();

beforeEach(() => {
    fetch.resetMocks();
    console.log('Mocks reset');
});

describe('handleSubmit and updateUI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <div>
        <form id="form">
          <input id="inputDestination" value="Paris" />
          <input type="date" id="tripStartDate" value="2023-12-01" />
          <input type="date" id="tripEndDate" value="2023-12-10" />
          <button type="submit">Submit</button>
        </form>
        <span id="destination"></span>
        <span id="departure"></span>
        <span id="tripLength"></span>
        <span id="countdown"></span>
        <div id="weatherForecast"></div>
        <div id="countryName"></div>
        <div id="countryCapital"></div>
        <div id="countryRegion"></div>
        <div id="countryPopulation"></div>
        <img id="countryFlag" />
      </div>
    `;

        // Manually add the event listener
        const form = document.getElementById('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSubmit();
        });
    });

    test('submits the form and updates the UI', async () => {
        fetch
            .mockResponseOnce(JSON.stringify({
                latitude: '48.8566',
                longitude: '2.3522',
                country: 'France'
            }))
            .mockResponseOnce(JSON.stringify({
                data: [
                    {
                        datetime: '2023-12-01',
                        high_temp: 10,
                        low_temp: 5,
                        weather: { description: 'Clear' },
                    },
                ],
            }))
            .mockResponseOnce(JSON.stringify({
                name: { common: 'France' },
                capital: ['Paris'],
                region: 'Europe',
                population: 67081000,
                flags: { png: 'https://restcountries.com/v3.1/img/flags/fr.png' },
            }));

        const form = document.getElementById('form');
        console.log('Submitting form');
        fireEvent.submit(form);

        // Wait for handleSubmit to complete
        await new Promise((r) => setTimeout(r, 1500));

        // Verify that fetch was called 3 times
        expect(fetch).toHaveBeenCalledTimes(3);

        // Verify the UI updates
        expect(document.getElementById('destination').textContent).toBe('48.8566, 2.3522, France');
        expect(document.getElementById('departure').textContent).toBe('2023-12-01');
        expect(document.getElementById('tripLength').textContent).toBe('Your trip length is 9 days.');
        expect(document.getElementById('countdown').textContent).toBe('Your trip is in 9 days.');
        expect(document.getElementById('weatherForecast').innerHTML).toContain('Clear');
        expect(document.getElementById('countryName').textContent).toBe('Country: France');
        expect(document.getElementById('countryCapital').textContent).toBe('Capital: Paris');
        expect(document.getElementById('countryRegion').textContent).toBe('Region: Europe');
        expect(document.getElementById('countryPopulation').textContent).toBe('Population: 67,081,000');
        expect(document.getElementById('countryFlag').src).toBe('https://restcountries.com/v3.1/img/flags/fr.png');
    });
});

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Local Storage Operations', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = `
            <div>
                <input id="inputDestination" value="Paris" />
                <input type="date" id="tripStartDate" value="2023-12-01" />
                <input type="date" id="tripEndDate" value="2023-12-10" />
                <button id="saveTrip">Save Trip</button>
                <button id="removeTrip">Remove Trip</button>
            </div>
        `;

        const saveButton = document.getElementById('saveTrip');
        const removeButton = document.getElementById('removeTrip');
        saveButton.addEventListener('click', saveTrip);
        removeButton.addEventListener('click', removeTrip);
    });

    test('saves trip to local storage', () => {
        const saveButton = document.getElementById('saveTrip');
        fireEvent.click(saveButton);

        const trips = JSON.parse(localStorage.getItem('trips'));
        expect(trips).toHaveLength(1);
        expect(trips[0]).toEqual({
            destination: 'Paris',
            startDate: '2023-12-01',
            endDate: '2023-12-10'
        });
    });

    test('removes trip from local storage', () => {
        // First, save a trip
        const saveButton = document.getElementById('saveTrip');
        fireEvent.click(saveButton);

        // Now, remove the trip
        const removeButton = document.getElementById('removeTrip');
        fireEvent.click(removeButton);

        const trips = JSON.parse(localStorage.getItem('trips'));
        expect(trips).toHaveLength(0);
    });
});

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
}
