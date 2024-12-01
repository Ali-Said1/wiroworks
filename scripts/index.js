import Konva from 'konva'
import { stage, layer, GRIDSIZE, addCompSVG, drawGrid, initializeComponent, componentHandler, initializeComptext, components, drawNodes, checkNearbybyCoords, nodeCircles, removeNodes, checkConnectionNodes, aStar, nodes, flashMsg, addingWire, setAddingWire, drawWire, genNetList } from './helpers';

import { Resistance, dcBattery, Switch, Wire, dcCurrentSource, Ground } from './classes';



stage.add(layer);

drawGrid(stage, layer, GRIDSIZE);

// Resistance Logic
const resistance = document.getElementById('resistance');
resistance.addEventListener('click', () => {
    console.log(addingWire)
    if (addingWire) return;
    if (checkNearbybyCoords([75, 60])) {
        const atOrigin = document.getElementById('atOriginalert');
        atOrigin.style.display = 'block'
        setTimeout(() => {
            atOrigin.style.display = 'none';
        }, 2000)
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
    if (checkNearbybyCoords([75, 60])) {
        const atOrigin = document.getElementById('atOriginalert');
        atOrigin.style.display = 'block'
        setTimeout(() => {
            atOrigin.style.display = 'none';
        }, 2000)
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
// DC Current source Logic
const dccs = document.getElementById('dcCurrentSource');

dccs.addEventListener('click', () => {
    if (addingWire) return;
    if (checkNearbybyCoords([75, 60])) {
        const atOrigin = document.getElementById('atOriginalert');
        atOrigin.style.display = 'block'
        setTimeout(() => {
            atOrigin.style.display = 'none';
        }, 2000)
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
// Wire Logic
let clickedNodes = [];
const wire = document.getElementById('wire');
wire.addEventListener('click', () => {
    if (addingWire) return;
    setAddingWire(true)
    const wirealert = document.getElementById('wirealert');
    wirealert.style.display = 'block'
    setTimeout(() => {
        wirealert.style.display = 'none';
    }, 2000)
    drawNodes();
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            wirealert.style.display = 'none';
            setAddingWire(false);
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
                    // else if (clickedNodes.length === 1 && checkConnectionNodes([...clickedNodes, node])) {
                    //     flashMsg(differentnode);
                    //     node.fill('#772F1A')
                    // }
                    else {
                        clickedNodes.push(node);
                    }
                }
                console.log(clickedNodes.length)
                console.log(clickedNodes)
                if (clickedNodes.length === 2) {
                    if (clickedNodes[0].x() === clickedNodes[1].x() && clickedNodes[0].y() === clickedNodes[1].y()) {
                        clickedNodes.pop();
                    } else {
                        setAddingWire(false);
                        removeNodes();
                        drawWire(stage, clickedNodes);
                        clickedNodes = [];
                    }
                }
                else if (clickedNodes.length > 2) {
                    let x = clickedNodes.length;
                    if (clickedNodes[0] == clickedNodes[1]) {
                        for (let i = 1; i < x; i++) clickedNodes.pop();
                    } else {
                        for (let i = 2; i < x; i++) clickedNodes.pop();
                        setAddingWire(false);
                        removeNodes();
                        drawWire(stage, clickedNodes);
                        clickedNodes = [];
                    }
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
// Ground Logic
const ground = document.getElementById('ground');
ground.addEventListener('click', () => {
    if (addingWire) return;
    if (checkNearbybyCoords([75, 60])) {
        const atOrigin = document.getElementById('atOriginalert');
        atOrigin.style.display = 'block'
        setTimeout(() => {
            atOrigin.style.display = 'none';
        }, 2000)
    }

    var imageObj = new Image();
    const groundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <!-- Vertical line coming from above -->
  <line x1="15" y1="0" x2="15" y2="15" stroke="black" stroke-width="1"/>
  <!-- Top horizontal line -->
  <line x1="5" y1="15" x2="25" y2="15" stroke="black" stroke-width="2"/>
  <!-- Middle horizontal line -->
  <line x1="10" y1="22" x2="20" y2="22" stroke="black" stroke-width="2"/>
  <!-- Bottom horizontal line -->
  <line x1="12" y1="30" x2="18" y2="30" stroke="black" stroke-width="2"/>
</svg>
`
    addCompSVG(imageObj, groundSvg);
    imageObj.onload = function () {
        var groundElement = new Ground({});
        // Init Ground inits one node only
        // Snap to grid for ground
        // check nearby objects for ground
        // no properties for ground, so add ground handler function
        // drag end handler logic
        // component node handler logic
        // occupied node handler logic
        // define the ground nodes
    }
})
// =============================================================================================================
//TODO: Add has wire property to the nodes and check for node.has wire in dragend handler
//TODO: Add Ground, and re-define the ground nodes
//TODO: Add wire deletion, double click on wire and confirm with alert..
//TODO: Handle the node.is connected property, if a component has any node connected, prevent drag, if user deleted connected component, delete all associated wires .. deleteWire()
//TODO: Remove connected wires on removing element
//TODO: wire logic user clicks on two points, if there is a component in between alert and dont draw
//TODO: add isConnected to the components when wires are added is connected is true for the linked components
//TODO: calculations create a table for the output with all branch currents and node values
//TODO: modified nodal analysis
//TODO: Dependent sources
//TODO: AC