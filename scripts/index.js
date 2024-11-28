import Konva from 'konva'

//Component types
// Resistance: Rohm
// Dc Voltage source: dcV
let currentId = 1;
let components = [];
let wires = [];
const GRIDSIZE = 30;
class Component extends Konva.Image {
    constructor(element) {
        super(element)
        this.node1 = [this.x(), this.y() + this.height() / 2];
        this.node2 = [this.x() + this.width(), this.y() + this.height() / 2];
        this.horizontal = true;
        this.type = ''
        this.value = 0;
        this.polarity = 'NULL'
        this.isConnected = false;
        this.ID = currentId++;
        this.prefix = ' '
        this.shownText = true
        this.unit = '';
    }
    getFirstNode() {
        return this.node1;
    }
    getSecondNode() {
        return this.node2;
    }
    setValue(val) {
        if (Number.isFinite(parseInt(val)) && val > 0) {
            this.value = parseInt(val);
        }
    }
    setPrefix(val) {
        const validPrefixes = ['p', 'n', 'µ', 'm', 'c', ' ', 'k', 'M', 'G', 'T'];

        // Check if val is in the validPrefixes array
        if (validPrefixes.includes(val)) {
            this.prefix = val; // Set the prefix if valid
        }
    }
    setRotationvalue(val) {
        if (Number.isFinite(parseInt(val)) && (parseInt(val)) == 0 || (parseInt(val)) == 90 || (parseInt(val)) == 180 || (parseInt(val)) == 270) {
            this.rotation(parseInt(val));
        }
    }
    getValue() {
        return this.value;
    }
}

class Resistance extends Component {
    constructor(element) {
        super(element)
        this.type = 'Resistance'
        this.unit = '\u03A9'
    }

}

class dcBattery extends Component {
    constructor(element) {
        super(element)
        this.type = 'DC Voltage Source';
        this.unit = 'V'
    }
}

class Switch extends Component {
    constructor(element) {
        super(element)
        this.state = 'on';
        this.type = 'Switch';
    }


    toggle() {
        this.state = (this.state === 'off') ? 'on' : 'off';
    }

    getState() {
        return this.state;
    }
}

class Wire extends Component {
    constructor(element) {
        super(element)
        this.type = 'Wire';
        this.connectedComponents = [];
    }
}

class dcCurrentSource extends Component {
    constructor(element) {
        super(element)
        this.type = 'DC Current Source';
        this.unit = 'A'
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

function showDetails(component, unit) {
    const html = `
    <div id="editProperties">
        <h2>${component.type}</h2>
        <label for="componentval">${component.type} Value = </label>
            <div class="direction">
                <input type="number" name="componentval" id="componentval" min="0" value=${component.value}>
                <div class="datalist-container" style="margin-right:20px;">
                    <input type="text" list="metric-prefixes" id="prefix" value="${component.prefix}">
                    <datalist id="metric-prefixes">
                        <option value="p">
                        <option value="n">
                        <option value="µ">
                        <option value="m">
                        <option value="c">
                        <option value=" ">
                        <option value="k">
                        <option value="M">
                        <option value="G">
                        <option value="T">
                    </datalist>
                </div>
            <span>${component.unit}</span>
        </div>
        <div class="rotation-labels">
            <label for="rotation">Rotation</label>
            <select name="rotatesel" id="rotation" ${component.isConnected ? 'disabled' : ''}>
            <option value="0" ${component.rotation() === 0 ? 'selected' : ''}>0</option>
            <option value="90" ${component.rotation() === 90 ? 'selected' : ''}>90</option>
            <option value="180" ${component.rotation() === 180 ? 'selected' : ''}>180</option>
            <option value="270" ${component.rotation() === 270 ? 'selected' : ''}>270</option>
            </select>
        </div>
        <div class="checkbox-container">
            <label for="showtext">Show Value</label>
            <select name="showntext" id="showtext">
            <option value="true" ${component.shownText === true ? 'selected' : ''}>On</option>
            <option value="false" ${component.shownText === false ? 'selected' : ''}>Off</option>
            </select>
        </div>
         <button class="mybutton" id="deleteBtn">delete</button>
        <button class="button" id="submitBtn">submit</button>
    </div>

        `

    const popupDiv = document.createElement('div');
    popupDiv.id = 'popupDiv'
    popupDiv.innerHTML = html;
    document.body.appendChild(popupDiv);
}
function checkNearby(component, newcoords) {
    for (const curr of components) {
        if (component.ID == curr.ID) {
            continue;
        }
        let currx = curr.x();
        let curry = curr.y();
        let boundx = Math.abs(currx - newcoords[0]);
        let boundy = Math.abs(curry - newcoords[1])
        if (component.horizontal) {
            if (boundx <= 90 && boundy <= 30) {
                return true;
            }
        } else {
            if (boundx <= 30 && boundy <= 90) {
                return true;
            }
        }
    }
    return false;
}
// =============================================================================================================
//======================Helpers======================
function addCompSVG(image, svg) {
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
function initializeComponent(component, image) {
    component.x(75);
    component.y(60);
    component.image(image);
    component.width(GRIDSIZE * 3);
    component.draggable(true);
    component.rotation(0);
    component.offsetX(component.width() / 2)
    component.offsetY(component.height() / 2)
}
function initializeComptext(component) {
    const text = new Konva.Text({
        x: component.x(), // Center the text above the resistance
        y: component.y() - 40, // Position it above the resistance
        text: `${component.getValue()}  ${component.unit}`,
        fontSize: 20,
        fontFamily: 'Calibri',
        fill: 'black',
        align: 'center',
        weight: 'bold',
        listening: false // Make it non-interactive
    });
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);
    text.x(component.x());
    text.y(text.y())
    component.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
    })
    component.on('mouseout', () => {
        document.body.style.cursor = 'default';
    })
    return text;
}
function componentHandler(component, text) {
    layer.add(component)
    components.push(component);
    layer.add(text)
    layer.draw();
    let currcoords = [component.x(), component.y()]
    component.on('dragstart', () => {
        text.hide();
    });
    component.on('dragend', () => {
        let newcoords = [];
        if (component.horizontal) {
            newcoords = [snapToGrid(component.x()) - 15, snapToGrid(component.y())];
        } else {
            newcoords = [snapToGrid(component.x()), snapToGrid(component.y()) - 15]
        }
        dragendHandler(component, text, newcoords, currcoords)
        text.show();
        layer.batchDraw();
    });
    component.on('dblclick', () => {
        showDetails(component, component.unit);
        let currRotation = component.rotation();
        const rotation = document.getElementsByClassName('rotation');
        rotation.value = currRotation;
        const deleteBtn = document.getElementById('deleteBtn');
        const submitBtn = document.getElementById('submitBtn');
        const popupDiv = document.getElementById('popupDiv');
        document.body.addEventListener('click', (event) => {
            if (!popupDiv.contains(event.target)) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        deleteBtn.addEventListener('click', () => {
            popupDiv.remove();
            components[component.ID] = 0;
            component.remove();
            text.remove();
            layer.batchDraw();
        })

        submitBtn.addEventListener('click', () => {
            const componentval = document.getElementById('componentval');
            const prefix = document.getElementById('prefix');
            const rotation = document.getElementById('rotation');
            component.setValue(componentval.value);
            component.setPrefix(prefix.value);
            if (!component.isConnected) {
                let previousOrient = component.horizontal;
                let previousRotation = component.rotation();
                component.setRotationvalue(rotation.value);
                if ((previousRotation == component.rotation()) || (Math.abs(previousRotation - component.rotation()) == 180)) { }
                else if (component.rotation() === 0 || component.rotation() === 180) {
                    component.horizontal = true;
                    if (!previousOrient)
                        component.position({ x: snapToGrid(component.x()) - 15, y: snapToGrid(component.y()) })
                }
                else {
                    component.horizontal = false;
                    if (previousOrient)
                        component.position({ x: snapToGrid(component.x()), y: snapToGrid(component.y()) - 15 })
                }
                updateText(component, text)
                handleCompNodes(component)
            }
            const shownText = document.getElementById('showtext');
            if (shownText.value == 'true')
                component.shownText = true;
            else if (shownText.value == 'false')
                component.shownText = false;
            popupDiv.remove();
            //TODO: Add update view function
            updateText(component, text)
            layer.batchDraw();
        })
    })
}
function handleCompNodes(component) {
    const rotation = component.rotation();
    if (rotation === 0) {
        component.node1 = [component.x() - component.width() / 2, component.y()]
        component.node2 = [component.x() + component.width() / 2, component.y()]
    }
    else if (rotation == 90) {
        component.node1 = [component.x(), component.y() - component.height() / 2]
        component.node2 = [component.x(), component.y() + component.height() / 2]
    }
    else if (rotation == 180) {
        component.node1 = [component.x() + component.width() / 2, component.y()]
        component.node2 = [component.x() + component.width() / 2, component.y()]
    }
    else if (rotation == 270) {
        component.node1 = [component.x(), component.y() + component.height() / 2]
        component.node2 = [component.x(), component.y() - component.height() / 2]
    }
}
function updateText(component, text) {
    text.offsetX(text.width() / 2)
    text.offsetY(text.height() / 2)
    if (component.rotation() === 0) {
        text.rotation(0);
        text.position({ x: component.x(), y: component.y() - 40 })
    }
    else if (component.rotation() === 90) {
        text.rotation(90);
        text.position({ x: component.x() + 40, y: component.y() })
    }
    else if (component.rotation() === 180) {
        text.rotation(180);
        text.position({ x: component.x(), y: component.y() + 40 })
    }
    else if (component.rotation() === 270) {
        text.rotation(270);
        text.position({ x: component.x() - 40, y: component.y() })
    }
    text.text(`${component.getValue()} ${component.prefix}${component.unit}`);
    text.hide();
    if (component.shownText)
        text.show();
}
function dragendHandler(component, text, newcoords, currcoords) {
    if (checkNearby(component, newcoords)) {
        component.position({ x: currcoords[0], y: currcoords[1] });
        return;
    }
    component.position({ x: newcoords[0], y: newcoords[1] });
    if (component.horizontal) {
        component.node1 = [newcoords[0], newcoords[1] + component.height() / 2]
        component.node2 = [newcoords[0] + component.width(), newcoords[1] + component.height() / 2]
    }
    else {
        component.node1 = [newcoords[0] + component.width() / 2, newcoords[1]];
        component.node1 = [newcoords[0] + component.width() / 2, newcoords[1] + component.height()];
    }
    currcoords[0] = newcoords[0]
    currcoords[1] = newcoords[1]
    updateText(component, text);
}
// Resistance Logic
const resistance = document.getElementById('resistance');
resistance.addEventListener('click', () => {
    var imageObj = new Image();
    const resistanceSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 30">
    <line x1="0" y1="15" x2="15" y2="15" stroke="black" stroke-width="2"/>
    <polyline points="15,15 20,5 30,25 40,5 50,25 60,5 70,25 75,15" fill="none" stroke="black" stroke-width="2"/>
    <line x1="75" y1="15" x2="90" y2="15" stroke="black" stroke-width="2"/>
    </svg>
    
    `;
    addCompSVG(imageObj, resistanceSvg)
    imageObj.onload = function () {
        var resistanceElement = new Resistance({});
        initializeComponent(resistanceElement, imageObj)
        const text = initializeComptext(resistanceElement)
        componentHandler(resistanceElement, text);
    }
});
// =============================================================================================================

// DC Voltage Logic
// =============================================================================================================
const dcvs = document.getElementById('dcBattery');

dcvs.addEventListener('click', () => {
    var imageObj = new Image();
    const dcvsSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
    <!-- Outer Circle (radius 25) -->
    <circle cx="45" cy="45" r="25" stroke="black" stroke-width="2" fill="none"/>
    <!-- Left Terminal (outside the circle) -->
    <line x1="0" y1="45" x2="20" y2="45" stroke="black" stroke-width="2"/>
    <!-- Right Terminal (outside the circle) -->
    <line x1="70" y1="45" x2="90" y2="45" stroke="black" stroke-width="2"/>
    <!-- Positive Sign inside the circle -->
    <line x1="35" y1="45" x2="40" y2="45" stroke="black" stroke-width="2"/>
    <line x1="37.5" y1="40" x2="37.5" y2="50" stroke="black" stroke-width="2"/>
  <!-- Negative Sign inside the circle -->
  <line x1="50" y1="45" x2="55" y2="45" stroke="black" stroke-width="2"/>
  </svg>
  
  `;
    addCompSVG(imageObj, dcvsSvg);
    imageObj.onload = function () {
        var dcvsElement = new dcBattery({});
        initializeComponent(dcvsElement, imageObj);
        const text = initializeComptext(dcvsElement);
        componentHandler(dcvsElement, text)
    }
})
// =============================================================================================================
// DC Current source Logic
const dccs = document.getElementById('dcCurrentSource');

dccs.addEventListener('click', () => {
    var imageObj = new Image();
    const dccsSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
  <!-- Outer Circle (radius 25) -->
  <circle cx="45" cy="45" r="25" stroke="black" stroke-width="2" fill="none"/>
  <!-- Left Terminal (outside the circle) -->
  <line x1="0" y1="45" x2="20" y2="45" stroke="black" stroke-width="2"/>
  <!-- Right Terminal (outside the circle) -->
  <line x1="70" y1="45" x2="90" y2="45" stroke="black" stroke-width="2"/>
  <!-- Arrow inside the circle (pointing left) -->
  <line x1="55" y1="45" x2="35" y2="45" stroke="black" stroke-width="2"/>
  <polygon points="35,45 40,40 40,50" fill="black"/>
</svg>

`
    addCompSVG(imageObj, dccsSvg);
    imageObj.onload = function () {
        var dccsElement = new dcCurrentSource({});
        initializeComponent(dccsElement, imageObj);
        const text = initializeComptext(dccsElement);
        componentHandler(dccsElement, text)
    }
})
// =============================================================================================================
//TODO: wire logic user clicks on two points, if there is a component in between alert and dont draw
//TODO: add isConnected to the components when wires are added is connected is true for the linked components
//TODO: Implement current sources, then start the logic (tmr)
//TODO: Add the rotation logic (after popup by Habiba)
//TODO: calculations create a table for the output with all branch currents and node values
//TODO: modified nodal analysis
//TODO: Dependent sources
//TODO: AC