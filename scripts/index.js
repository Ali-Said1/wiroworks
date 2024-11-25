import { Canvas, Line, Circle } from 'fabric';

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

const battery = document.getElementById('battery');

battery.addEventListener('click', () => {
    
})