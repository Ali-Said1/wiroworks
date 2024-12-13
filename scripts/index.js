import Konva from 'konva'
import { stage, layer, GRIDSIZE, addCompSVG, drawGrid, initializeComponent, componentHandler, initializeComptext, components, drawNodes, checkNearbybyCoords, nodeCircles, removeNodes, checkConnectionNodes, aStar, nodes, flashMsg, addingWire, setAddingWire, drawWire, genNetList, enableDragging, disableDragging } from './helpers';

import { Resistance, dcBattery, ddcBattery, Switch, Wire, dcCurrentSource, ddcCurrentSource, Ground } from './classes';



drawGrid();

const componentsHub = new Konva.Text({
    x: 10, // 10px from the left
    y: 10, // 10px from the top
    text: 'Components Hub',
    fontSize: 20,
    fontFamily: 'Arial',
    fill: 'black', // Text color
});

// Add the Text to the Layer
layer.add(componentsHub);
// Resistance Logic
const resistance = document.getElementById('resistance');
resistance.addEventListener('click', () => {
    console.log(addingWire)
    if (addingWire) return;
    if (checkNearbybyCoords([75, 90])) {
        const atOrigin = document.getElementById('atOriginalert');
        flashMsg(atOrigin);
        return;
    }
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
    if (addingWire) return;
    if (checkNearbybyCoords([75, 90])) {
        const atOrigin = document.getElementById('atOriginalert');
        flashMsg(atOrigin);
        return;
    }
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
// Dependednt DC Voltage Logic
// =============================================================================================================
const ddcvs = document.getElementById('DependentVoltageSource');

ddcvs.addEventListener('click', () => {
    if (addingWire) return;
    if (checkNearbybyCoords([75, 90])) {
        const atOrigin = document.getElementById('atOriginalert');
        flashMsg(atOrigin);
        return;
    }
    var imageObj = new Image();
    const ddcvsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
  <!-- Outer Rhombus -->
  <polygon points="45,20 70,45 45,70 20,45" stroke="black" stroke-width="2" fill="none"/>
  <!-- Left Terminal (outside the rhombus) -->
  <line x1="0" y1="45" x2="20" y2="45" stroke="black" stroke-width="2"/>
  <!-- Right Terminal (outside the rhombus) -->
  <line x1="70" y1="45" x2="90" y2="45" stroke="black" stroke-width="2"/>
  <!-- Positive Sign inside the rhombus -->
  <line x1="35" y1="45" x2="40" y2="45" stroke="black" stroke-width="2"/>
  <line x1="37.5" y1="40" x2="37.5" y2="50" stroke="black" stroke-width="2"/>
  <!-- Negative Sign inside the rhombus -->
  <line x1="50" y1="45" x2="55" y2="45" stroke="black" stroke-width="2"/>
</svg>

  `;
    addCompSVG(imageObj, ddcvsSvg);
    imageObj.onload = function () {
        var ddcvsElement = new ddcBattery({});
        initializeComponent(ddcvsElement, imageObj);
        const text = initializeComptext(ddcvsElement);
        componentHandler(ddcvsElement, text)
        console.log(components)
    }
})
// =============================================================================================================
// DC Current source Logic
const dccs = document.getElementById('dcCurrentSource');

dccs.addEventListener('click', () => {
    if (addingWire) return;
    if (checkNearbybyCoords([75, 90])) {
        const atOrigin = document.getElementById('atOriginalert');
        atOrigin.style.display = 'block'
        setTimeout(() => {
            atOrigin.style.display = 'none';
        }, 2000)
        return;
    }
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
// Dependednt DC Current Logic
// =============================================================================================================
const ddccs = document.getElementById('DependentCurrentSource');

ddccs.addEventListener('click', () => {
    if (addingWire) return;
    if (checkNearbybyCoords([75, 90])) {
        const atOrigin = document.getElementById('atOriginalert');
        flashMsg(atOrigin);
        return;
    }
    var imageObj = new Image();
    const ddccsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90">
  <!-- Outer Rhombus -->
  <polygon points="45,20 70,45 45,70 20,45" stroke="black" stroke-width="2" fill="none"/>
  <!-- Left Terminal (outside the rhombus) -->
  <line x1="0" y1="45" x2="20" y2="45" stroke="black" stroke-width="2"/>
  <!-- Right Terminal (outside the rhombus) -->
  <line x1="70" y1="45" x2="90" y2="45" stroke="black" stroke-width="2"/>
  <!-- Arrow inside the rhombus (pointing left) -->
  <line x1="55" y1="45" x2="35" y2="45" stroke="black" stroke-width="2"/>
  <polygon points="35,45 40,40 40,50" fill="black"/>
</svg>
  `;
    addCompSVG(imageObj, ddccsSvg);
    imageObj.onload = function () {
        var ddccsElement = new ddcCurrentSource({});
        initializeComponent(ddccsElement, imageObj);
        const text = initializeComptext(ddccsElement);
        componentHandler(ddccsElement, text)
    }
})
// =============================================================================================================
// Wire Logic
let clickedNodes = [];
const wire = document.getElementById('wire');
wire.addEventListener('click', () => {
    if (addingWire) return;
    setAddingWire(true)
    disableDragging();
    const wirealert = document.getElementById('wirealert');
    flashMsg(wirealert);
    drawNodes();
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            wirealert.style.display = 'none';
            setAddingWire(false);
            enableDragging();
            removeNodes();
            clickedNodes = [];
            return;
        }
    })
})

document.body.addEventListener('click', (event) => {
    if (addingWire) {
        let nodeClicked = false;

        nodeCircles.forEach((node) => {
            if (Math.abs(event.x - node.x()) < 5 && Math.abs(event.y - node.y()) < 5) nodeClicked = true;
        })
        if (!nodeClicked) {
            event.preventDefault();
            event.stopPropagation();
        }
        const differentnode = document.getElementById('differentnode');
        nodeCircles.forEach((node) => {
            if (Math.abs(event.x - node.x()) < 4 && Math.abs(event.y - node.y()) < 4) {
                if (clickedNodes.length < 2) {
                    if (clickedNodes.find((cnode) => cnode === node)) {
                        flashMsg(differentnode);
                    }
                    else {
                        clickedNodes.push(node);
                    }
                }
                clickedNodes = [... new Set(clickedNodes)];
                if (clickedNodes.length === 2) {
                    setAddingWire(false);
                    enableDragging();
                    if (!drawWire(clickedNodes)) alert('Can\'t draw a wire between those nodes');
                    clickedNodes = [];
                }
            }
        })
    }
})

const run = document.getElementById('run')
run.addEventListener('click', () => {
    genNetList();
})
// =============================================================================================================

// =============================================================================================================
//TODO: modified nodal analysis
//TODO: Dependent sources: check if depends on null, set the value to 0
//TODO: AC