import Konva from 'konva'

const GRIDSIZE = 30;
class Component extends Konva.Image {
    constructor(element) {
        super(element)
        this.resistance = 0;
        this.node1 = [this.x, this.y];
        this.node2 = [this.x + this.width, this.y];
        this.horizontal = true;
    }
    getFirstNode() {
        return this.node1;
    }
    getSecondNode() {
        return this.node2;
    }
}

class Resistance extends Component {
    constructor(element) {
        super(element)
        this.resistance = 0;
    }
    getResistance() {
        return this.resistance;
    }
}

let width = window.innerWidth
let height = window.innerHeight

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
})

let layer = new Konva.Layer();
stage.add(layer);

function drawGrid(layer, gridSize) {
    const width = stage.width();
    const height = stage.height();

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
        const line = new Konva.Line({
            points: [x, 0, x, height],
            stroke: 'lightgray',
            strokeWidth: 1,
            listening: false, // Disable events for grid lines
        });
        layer.add(line);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
        const line = new Konva.Line({
            points: [0, y, width, y],
            stroke: 'lightgray',
            strokeWidth: 1,
            listening: false,
        });
        layer.add(line);
    }

    // Circles at grid intersections
    for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
            const circle = new Konva.Circle({
                x: x,
                y: y,
                radius: 1,
                fill: 'darkgray',
                listening: false,
            });
            layer.add(circle);
        }
    }

    // Draw the layer
    layer.draw();
}

drawGrid(layer, GRIDSIZE);
//TODO: Handle snapping based on rotation
function snapToGrid(value) {
    return Math.round(value / GRIDSIZE) * GRIDSIZE;
}
const resistance = document.getElementById('resistance');
resistance.addEventListener('click', () => {
    var imageObj = new Image();
    imageObj.src = 'https://th.bing.com/th/id/R.7a7b3d6c2a0b7068cee1483483abefdf?rik=H6BFJTK6fDNFYQ&pid=ImgRaw&r=0';
    imageObj.onload = function () {
        var resistanceElement = new Resistance({
            x: 60,
            y: 48,
            image: imageObj,
            width: GRIDSIZE * 3,
            height: GRIDSIZE * 3,
            draggable: true,
            rotation: 0
        });
        resistanceElement.on('dragend', () => {
            const newX = snapToGrid(resistanceElement.x());
            const newY = snapToGrid(resistanceElement.y()) - 12;
            resistanceElement.position({ x: newX, y: newY });
            resistanceElement.node1 = [newX, newY];
            resistanceElement.node2 = [newX + GRIDSIZE * 3, newY];
            layer.batchDraw();
        });
        resistanceElement.on('click', () => {
            console.log(resistanceElement.getResistance());
            console.log(resistanceElement.getFirstNode());
            console.log(resistanceElement.getSecondNode());
        })
        resistanceElement.on('dblclick', () => {
            // TODO: Show a dialouge that shows the info of the component: here resistance and rotation and allows editing
            alert(resistanceElement.getResistance());
        })
        layer.add(resistanceElement);
        layer.draw();
    }
});
// resistance.addEventListener('click', () => {
//     Konva.Image.fromURL('https://th.bing.com/th/id/R.7a7b3d6c2a0b7068cee1483483abefdf?rik=H6BFJTK6fDNFYQ&pid=ImgRaw&r=0', function (image) {
//         image.setAttrs({
//             x: 50,
//             y: 50,
//             width: 90,
//             height: 90,
//             draggable: true
//         });
//         image.on('dragmove', () => {
//             const newX = snapToGrid(image.x());
//             const newY = snapToGrid(image.y()) - 12;
//             image.position({ x: newX, y: newY });
//             layer.batchDraw(); // Batch draw for performance
//         });
//         layer.add(image)
//         layer.draw()
//     }, function (error) {
//         console.error('Image loading error:', error.composedPath()); // Optional error handling
//     });
// });
