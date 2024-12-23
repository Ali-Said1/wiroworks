const imageContainer = document.querySelector('.image-container');
const components = document.querySelector('.components');

let isScrolling = false; // Flag to track if scrolling is active
let scrollInterval; // Variable to hold the interval ID

// Function to start scrolling
function startScrolling(direction) {
    isScrolling = true;
    scrollInterval = setInterval(() => {
        imageContainer.scrollBy({ top: direction * 10, behavior: 'smooth' }); // Scroll up or down
    }, 100); // Adjust the interval time as needed
}

// Function to stop scrolling
function stopScrolling() {
    isScrolling = false;
    clearInterval(scrollInterval);
}

// Event listeners for mouse down, up, and move
components.addEventListener('mousedown', (event) => {
    const { clientY } = event;
    const { top, bottom } = components.getBoundingClientRect();

    // Check if the mouse is in the top half
    if (clientY < top + (bottom - top) / 2) {
        startScrolling(-1); // Scroll up
    }
    // Check if the mouse is in the bottom half
    else {
        startScrolling(1); // Scroll down
    }
});

components.addEventListener('mouseup', stopScrolling);
components.addEventListener('mouseleave', stopScrolling); // Stop scrolling when mouse leaves the component

const userguideSubmit = document.getElementById('userguide-done');

userguideSubmit.addEventListener('click', () => {
    const userguide = document.getElementById('user-guide');
    userguide.remove();
});