import { Canvas, Line, Circle, FabricImage, Rect } from 'fabric';

class Resistance extends FabricImage {
    constructor(element, options) {
        super(element, options);
        this.resistance = 0;
    }
    getResistance() {
        return this.resistance;
    }
}

// Create a canvas element
const canvasElement = document.createElement('canvas');
canvasElement.width = document.documentElement.clientWidth;
canvasElement.height = document.documentElement.clientHeight;

const canvas = new Canvas(canvasElement);

function drawGrid(canvas, gridSize) {
    const width = canvasElement.width;
    const height = canvasElement.height;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {

        const line = new Line([x, 0, x, height], {
            stroke: 'lightgray',
            strokeWidth: 1,
            selectable: false,
            evented: false,
        });
        canvas.add(line);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
        const line = new Line([0, y, width, y], {
            stroke: 'lightgray',
            strokeWidth: 1,
            selectable: false,
            evented: false,
        });
        canvas.add(line);
    }
    for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
            const circle = new Circle({
                left: x - 1,
                top: y - 1,
                radius: 1,
                fill: 'darkgray',
                selectable: false,
                evented: false,
            });
            canvas.add(circle);
        }
    }
}

drawGrid(canvas, 30);

canvas.renderAll();

document.body.appendChild(canvasElement);

const resistance = document.getElementById('resistance');

resistance.addEventListener('click', () => {
    const demoImg = 'https://th.bing.com/th/id/R.a67ddbcf497f97f3e5ca0dc275c80913?rik=HXLntj9JrfzWpA&pid=ImgRaw&r=0'; // Path to your resistance image
    const radius = 300; // Desired radius for scaling

    const imgElement = new Image();
    imgElement.src = demoImg;
    imgElement.onload = () => {
        console.log("Image loaded");
        // Create a new instance of Resistance (which extends FabricImage)
        const img = new Resistance(imgElement, {
            left: 100, // Set X position
            top: 100,  // Set Y position
            scaleX: radius / imgElement.width, // Scale based on radius
            scaleY: radius / imgElement.height, // Scale based on radius
            selectable: true, // Ensure the object is selectable
            hasControls: true, // Enable control points for resizing
            hasBorders: true,
        });

        // Add the image to the canvas
        canvas.add(img);
        //canvas.renderAll(); // Render the canvas
    };
    imgElement.onerror = (error) => {
        console.error("Error loading image:", error);
    }
});

canvas.on('object:moving', function (e) {
    const obj = e.target;

    // Calculate the nearest grid position
    obj.left = Math.round(obj.left / gridSize) * gridSize;
    obj.top = Math.round(obj.top / gridSize) * gridSize;

    // Update the object's position
    obj.setCoords();
});

const rect = new Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 50,
    height: 50,
    selectable: true, // Ensure the object is selectable
    draggable: true,
    hasControls: true,
    hasBorders: true
});

// Add the rectangle to the canvas
canvas.add(rect);