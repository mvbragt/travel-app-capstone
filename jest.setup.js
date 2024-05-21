require('jest-fetch-mock').enableMocks();

const { JSDOM } = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>', { url: "http://localhost/" });
const { window } = jsdom;

global.window = window;
global.document = window.document;

Object.keys(window).forEach((property) => {
    if (typeof global[property] === 'undefined') {
        global[property] = window[property];
    }
});
