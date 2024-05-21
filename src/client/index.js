// Import Styling Sheets
import "./styles/styles.scss";


// Import JavaScript modules
import { handleSubmit } from './js/destinationHandler';

// Attach the handleSubmit function to the global window object so it can be accessed by the inline 'onsubmit' event in index.html.
window.handleSubmit = handleSubmit;
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
});
