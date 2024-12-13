import { Ground, Wire, ControlSource } from './classes';
import Konva from 'konva'
const math = require('mathjs')
// Get the initial width and height of the window, used in all the calculations
const width = window.innerWidth
const height = window.innerHeight
// Initialize the stage and layer objects
export var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
})
export let layer = new Konva.Layer();
stage.add(layer);
// Define the size of 1 Grid Square (30 * 30)
export const GRIDSIZE = 30;
const rownumberofNodes = parseInt(width / GRIDSIZE) // Number of nodes in a row
// Array of components to index the added components
export let components = [];
export let ground = null;
export let nodeCircles = []; // A list of the drawn circles about each node, to calrify the nodes for the user
export let wires = []; // An array of all the wires generated
export let nodes = []; // All the nodes within the page
export let addingWire = false; // Used in blocking user interaction while adding wires
export let outputNodes = [];
let uniqueNodes = {};
let nodeCounter = 1;

// Setter for the addingWire variable
export function setAddingWire(value) {
    addingWire = value;
}
//========================================Flash Message Function==========================================
export function flashMsg(msg) {
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none'
    }, 2000)
}
//========================================Add Component SVG Function==========================================
export function addCompSVG(image, svg) {
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` // Encodes the svg
}
//========================================Get Node Index Function==========================================
export function getIndex(x, y) { // helper function to get a node index
    let currentRow = (y - GRIDSIZE) / GRIDSIZE
    let nodeNumberinRow = (x - GRIDSIZE) / GRIDSIZE
    return rownumberofNodes * currentRow + nodeNumberinRow
}
//========================================Grid Drawing Function==========================================
export function drawGrid() {
    // Vertical lines
    for (let x = 0; x <= width; x += GRIDSIZE) {
        const line = new Konva.Line({
            points: [x, 0, x, height],
            stroke: 'lightgray',
            strokeWidth: 1,
            listening: false, // Disable events for grid lines
        });
        layer.add(line);
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += GRIDSIZE) {
        const line = new Konva.Line({
            points: [0, y, width, y],
            stroke: 'lightgray',
            strokeWidth: 1,
            listening: false,
        });
        layer.add(line);
    }

    // Circles at grid intersections
    for (let y = 0; y <= height; y += GRIDSIZE) {
        for (let x = 0; x <= width; x += GRIDSIZE) {
            const circle = new Konva.Circle({
                x: x,
                y: y,
                radius: 1,
                fill: 'darkgray',
                listening: false,
            });
            layer.add(circle);
            // Filling the nodes array with all the nodes in the page
            if (x > 0 && y > 0) {

                let node = {}; // node object with properties: index, position, occupied (for the aStar algorithm) and neighbouring nodes

                node.index = getIndex(x, y);
                node.occupied = false;
                node.position = { x: x, y: y };
                if (x !== GRIDSIZE) {
                    node.left = { index: node.index - 1 }
                }
                if (y !== GRIDSIZE) {
                    node.top = { index: node.index - rownumberofNodes };
                }
                if (x !== width - GRIDSIZE) {
                    node.right = { index: node.index + 1 }
                }
                if (y !== height - GRIDSIZE) {
                    node.bottom = { index: node.index + rownumberofNodes }
                }
                nodes.push(node);
            }
        }
    }
    console.log(nodes)
    addGround();
    // Draw the layer
    layer.draw();
}

//========================================Add Ground Function==========================================
export function addGround() {
    var imageObj = new Image();
    const groundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="30" viewBox="0 0 60 30">
  <!-- Vertical line coming from above -->
  <line x1="30" y1="0" x2="30" y2="15" stroke="black" stroke-width="2"/>
  <!-- Top horizontal line -->
  <line x1="14" y1="15" x2="46" y2="15" stroke="black" stroke-width="2"/>
  <!-- Middle horizontal line -->
  <line x1="20" y1="20" x2="40" y2="20" stroke="black" stroke-width="2"/>
  <!-- Bottom horizontal line -->
  <line x1="24" y1="25" x2="36" y2="25" stroke="black" stroke-width="2"/>
</svg>`
    addCompSVG(imageObj, groundSvg);

    imageObj.onload = function () { // wait for the image to load
        var groundElement = new Ground({})
        groundElement.width(GRIDSIZE * 2);
        groundElement.offsetX(groundElement.width() / 2)
        groundElement.x(snapToGrid(width - 60));
        groundElement.y(60);
        groundElement.image(imageObj);
        groundElement.draggable(true);
        groundElement.rotation(0);

        let nodeIdx = getIndex(groundElement.x(), groundElement.y())
        groundElement.node = nodes[nodeIdx]; // link the ground's node to one of the nodes in the nodes array
        nodes[groundElement.node.bottom.index].occupied = true;
        layer.add(groundElement)
        ground = groundElement;
        // Change the cursor to pointer on hover
        groundElement.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
        })
        groundElement.on('mouseout', () => {
            document.body.style.cursor = 'default';
        })
        let currcoords = [groundElement.x(), groundElement.y()];
        groundElement.on('dragend', () => {
            let newcoords = [snapToGrid(groundElement.x()), snapToGrid(groundElement.y())];
            if (checkNearby(groundElement, newcoords)) {
                groundElement.position({ x: currcoords[0], y: currcoords[1] }); // re-place the ground at old coords
                layer.batchDraw();
            }
            else {
                nodes[groundElement.node.bottom.index].occupied = false;
                currcoords[0] = newcoords[0]
                currcoords[1] = newcoords[1]
                groundElement.position({ x: currcoords[0], y: currcoords[1] });
                let newNodeIdx = getIndex(groundElement.x(), groundElement.y());
                groundElement.node = nodes[newNodeIdx];
                nodes[groundElement.node.bottom.index].occupied = true;
            }
        })
    }
}
//========================================Check Nearby Components Function==========================================
export function checkNearby(component, newcoords) {
    // Check if the newcoords are near the boundaries of the webpage
    if (newcoords[0] < 60 || Math.abs(width - newcoords[0]) < 60 || newcoords[1] < 60 || Math.abs(height - newcoords[1]) < 60) {
        return true;
    }
    // Compare the component location to the ground location
    if (component !== ground) {
        let boundGndx = Math.abs(ground.x() - newcoords[0])
        let boundGndy = ground.y() - newcoords[1]
        if (component.horizontal && boundGndx <= 60 && (boundGndy === 0 || boundGndy === -30))
            return true;
        else if (!component.horizontal && boundGndx <= 30 && (boundGndy === - 75 || Math.abs(boundGndy) <= 60))
            return true;
    }
    for (const curr of components) {
        if (curr == null || component.ID == curr.ID) {
            continue;
        }
        let currx = curr.x();
        let curry = curr.y();
        let boundx = Math.abs(currx - newcoords[0]);
        let groundYCheck = curry - newcoords[1];
        let boundy = Math.abs(groundYCheck);
        if (component == ground) { // Checking if the current moving element is the ground
            if (curr.horizontal && boundx <= 60 && (boundy === 0 || groundYCheck === 30)) return true;
            else if (!curr.horizontal && boundx <= 30 && (groundYCheck === 75 || boundy <= 60)) return true;
        }
        else {
            if (component.horizontal && curr.horizontal) {
                if (boundx <= 90 && boundy <= 30) {
                    return true;
                }
            }
            else if (!component.horizontal && !curr.horizontal) {
                if (boundx <= 30 && boundy <= 90) {
                    return true;
                }
            }
            else {
                if (boundx <= 90 && boundy <= 90) {
                    return true;
                }
            }
        }
    }
    return false;
}
export function checkNearbybyCoords(coords) { // Used to check for adding components in the components hub only
    for (const curr of components) {
        if (curr == null) {
            continue;
        }
        let currx = curr.x();
        let curry = curr.y();
        let boundx = Math.abs(currx - coords[0]);
        let boundy = Math.abs(curry - coords[1])
        if (curr.horizontal) {
            if (boundx <= 90 && boundy <= 30) {
                return true;
            }
        } else {
            if (boundx <= 90 && boundy <= 90) {
                return true;
            }
        }
    }
    return false;
}
//========================================Snap Components to Grid Function==========================================
export function snapToGrid(value) {
    return Math.round(value / GRIDSIZE) * GRIDSIZE;
}
//========================================Show Component details Function==========================================
export function showDetails(component) {
    const html = `
    <div id="editProperties">
        <h2>${component.type}</h2>
        <label for="componentval">${component.type} ${component.dependent ? 'Gain' : 'Value'} = </label>
            <div class="direction">
                <input type="number" name="componentval" id="componentval" min="0" value=${component.dependent ? component.gain : component.value}>
                <div class="datalist-container">
                    <select name="rotatesel" id="prefix">
                        <option value="p" ${component.prefix === 'p' ? 'selected' : ''}>p</option>
                        <option value="n" ${component.prefix === 'n' ? 'selected' : ''}>n</option>
                        <option value="µ" ${component.prefix === 'µ' ? 'selected' : ''}>µ</option>
                        <option value="m" ${component.prefix === 'm' ? 'selected' : ''}>m</option>
                        <option value="c" ${component.prefix === 'c' ? 'selected' : ''}>c</option>
                        <option value=" " ${component.prefix === ' ' ? 'selected' : ''}>No Prefix</option>
                        <option value="k" ${component.prefix === 'k' ? 'selected' : ''}>k</option>
                        <option value="M" ${component.prefix === 'M' ? 'selected' : ''}>M</option>
                        <option value="G" ${component.prefix === 'G' ? 'selected' : ''}>G</option>
                        <option value="T" ${component.prefix === 'T' ? 'selected' : ''}>T</option>
                    </select>
                </div>
                ${component.dependent ? '' : `<span>${component.unit}</span>`}
        </div>
        <div class="rotation-labels">
            <label for="rotation">Rotation</label>
            <select name="rotatesel" id="rotation">
            <option value="0" ${component.rotation() === 0 ? 'selected' : ''}>0</option>
            <option value="90" ${component.rotation() === 90 ? 'selected' : ''}>90</option>
            <option value="180" ${component.rotation() === 180 ? 'selected' : ''}>180</option>
            <option value="270" ${component.rotation() === 270 ? 'selected' : ''}>270</option>
            </select>
        </div>
        ${getDependencies(component)}
        <div class="checkbox-container">
            <label for="showtext">Show Value</label>
            <select name="showntext" id="showtext">
            <option value="true" ${component.shownText === true ? 'selected' : ''}>On</option>
            <option value="false" ${component.shownText === false ? 'selected' : ''}>Off</option>
            </select>
        </div>
         <button class="mybutton" id="deleteBtn">delete</button>
        <button class="button" id="submitBtn">submit</button>
    </div >
        `
    const popupDiv = document.createElement('div');
    popupDiv.id = 'popupDiv'
    popupDiv.innerHTML = html;
    document.body.appendChild(popupDiv);
}
function getDependencies(component) {
    if (!component.dependent) return "";
    let controlsource = component.controlsource;
    let html = `<div class="dependencyType" >
        <label for="dependenttype">Type: </label>
        <select name="dependencytypesel" id="dependenttype">
        <option value=${ControlSource.CURRENT} ${(ControlSource.CURRENT === component.controlsource) ? 'selected' : ''}>${ControlSource.CURRENT}</option>
        <option value=${ControlSource.VOLTAGE} ${(ControlSource.VOLTAGE === component.controlsource) ? 'selected' : ''}>${ControlSource.VOLTAGE}</option>
        </select>
        <span>controlled</span>
        </div>
        `
    html += `<div class="dependency" >
        <label for="dependson">Depends on</label>
        <select name="dependencysel" id="dependson">`
    components.forEach((comp, idx) => {
        if (comp === null || comp.dependent) return;
        let selected = false;
        if (component.dependency == idx) selected = true;
        html += `<option value=${idx} ${selected ? 'selected' : ''}>${comp.name}</option>`
    })
    html += `</select>
    </div> `;
    return html;
}
//========================================Set Occupied Nodes Function==========================================
export function setOccupied(component) {
    if (component.rotation() === 0) {
        nodes[component.node1.right.index].occupied = true;
        nodes[nodes[component.node1.right.index].right.index].occupied = true;
    }
    if (component.rotation() === 90) {
        nodes[component.node1.bottom.index].occupied = true;
        nodes[nodes[component.node1.bottom.index].bottom.index].occupied = true;
    }
    if (component.rotation() === 180) {
        nodes[component.node2.right.index].occupied = true;
        nodes[nodes[component.node2.right.index].right.index].occupied = true;
    }
    if (component.rotation() === 270) {
        nodes[component.node2.bottom.index].occupied = true;
        nodes[nodes[component.node2.bottom.index].bottom.index].occupied = true;
    }
}
export function unsetOccupied(component) {
    if (component.rotation() === 0) {
        nodes[component.node1.right.index].occupied = false;
        nodes[nodes[component.node1.right.index].right.index].occupied = false;
    }
    if (component.rotation() === 90) {
        nodes[component.node1.bottom.index].occupied = false;
        nodes[nodes[component.node1.bottom.index].bottom.index].occupied = false;
    }
    if (component.rotation() === 180) {
        nodes[component.node2.right.index].occupied = false;
        nodes[nodes[component.node2.right.index].right.index].occupied = false;
    }
    if (component.rotation() === 270) {
        nodes[component.node2.bottom.index].occupied = false;
        nodes[nodes[component.node2.bottom.index].bottom.index].occupied = false;
    }
}
//========================================Component Initializer Function==========================================
export function initializeComponent(component, image) {
    component.width(GRIDSIZE * 3);
    component.height(GRIDSIZE * 3)
    component.offsetX(component.width() / 2)
    component.offsetY(component.height() / 2)
    component.x(75);
    component.y(90);
    component.image(image);
    component.draggable(true);
    component.rotation(0);
    let node1_index = getIndex(component.x() - component.width() / 2, component.y());
    let node2_index = getIndex(component.x() + component.width() / 2, component.y());
    component.node1 = nodes[node1_index]
    component.node2 = nodes[node2_index]
    setOccupied(component);
}
//========================================Component Text Initialzier Function==========================================
export function initializeComptext(component) {
    let literaltext;
    if (component.dependent) {
        literaltext = `${component.name}`;
    }
    else
        literaltext = `${component.name} ${component.getValue()}${component.unit}`;
    const text = new Konva.Text({
        x: component.x(), // Center the text above the resistance
        y: component.y() - 40, // Position it above the resistance
        text: literaltext,
        fontSize: 20,
        fontFamily: 'Calibri',
        fill: 'black',
        align: 'center',
        weight: 'bold',
        listening: false // Make it non-interactive
    });
    // Set the offset of the text to center it
    text.offsetX(text.width() / 2);
    text.offsetY(text.height() / 2);
    text.x(component.x());
    text.y(text.y())
    return text;
}
//========================================Component Handler Function==========================================
export function componentHandler(component, text) {
    component.text = text; // setting the text reference in the component data members
    layer.add(component)
    components.push(component); // updating the components array
    layer.add(component.text)
    layer.draw();
    // Set the cursor to pointer on hover
    component.on('mouseover', () => {
        document.body.style.cursor = 'pointer';
    })
    component.on('mouseout', () => {
        document.body.style.cursor = 'default';
    })
    // Array that holds the current coordinates of the component in case of undoing position shift
    let currcoords = [component.x(), component.y()]
    component.on('dragstart', () => {
        component.text.hide();
    });
    component.on('dragend', () => {
        let newcoords = [];
        if (component.horizontal) { // Set the newcoords according to the gridsystem and component orientation
            newcoords = [snapToGrid(component.x()) - 15, snapToGrid(component.y())];
        } else {
            newcoords = [snapToGrid(component.x()), snapToGrid(component.y()) - 15];
        }
        dragendHandler(component, newcoords, currcoords);
        layer.batchDraw(); // update the layer
    });
    component.on('dblclick', () => {
        if (addingWire) return; // Disable the interaction while adding wire
        showDetails(component); // Show the details popup
        let currRotation = component.rotation();
        const rotation = document.getElementsByClassName('rotation');
        rotation.value = currRotation;
        const deleteBtn = document.getElementById('deleteBtn');
        const submitBtn = document.getElementById('submitBtn');
        const popupDiv = document.getElementById('popupDiv');
        window.addEventListener('keydown', (event) => { // Escape button closes the popup
            if (event.key === 'Escape') {
                popupDiv.remove();
            }
        })
        deleteBtn.addEventListener('click', () => { // Delete button removes the component
            popupDiv.remove();
            removeComponent(component);
            layer.batchDraw();
        })

        submitBtn.addEventListener('click', () => {
            const componentval = document.getElementById('componentval');
            if (component.dependent) { // Set the dependency
                const dependson = document.getElementById('dependson');
                component.dependency = dependson.value;
                component.setGain(componentval.value) // Set the Gain
                const dependenttype = document.getElementById('dependenttype');
                console.log(dependenttype.value);
                component.setControlSource(dependenttype.value);
            }
            else {
                component.setValue(componentval.value); // Set the component value
            }
            const prefix = document.getElementById('prefix');
            const rotation = document.getElementById('rotation');
            component.setPrefix(prefix.value); // Update the prefix
            let previousRotation = component.rotation(); // Saving the value of the current rotation
            component.setRotationvalue(rotation.value); // Updating the rotation
            if ((previousRotation === component.rotation()) || (Math.abs(previousRotation - component.rotation()) === 180)) { } // Checking if the component is flipped, no validation of component position is needed
            else if (component.rotation() === 0 || component.rotation() === 180) { // Checking if the component was rotated to be horizontal
                component.horizontal = true;
                if (checkNearby(component, [snapToGrid(component.x()) - 15, snapToGrid(component.y())])) { // Checking if the component overlaps
                    component.horizontal = false;
                    component.setRotationvalue(previousRotation); // Undoing the rotation
                    const norotate = document.getElementById('norotate');
                    flashMsg(norotate)
                } else {
                    component.position({ x: snapToGrid(component.x()) - 15, y: snapToGrid(component.y()) })
                    currcoords = [component.x(), component.y()];
                }
            }
            else { // Same steps but for the case of rotating to be vertical
                component.horizontal = false;
                if (checkNearby(component, [snapToGrid(component.x()), snapToGrid(component.y()) - 15])) {
                    component.horizontal = true;
                    component.setRotationvalue(previousRotation);
                    const norotate = document.getElementById('norotate');
                    flashMsg(norotate)
                }
                else {
                    component.position({ x: snapToGrid(component.x()), y: snapToGrid(component.y()) - 15 })
                    currcoords = [component.x(), component.y()];
                }
            }
            unsetOccupied(component)  // unsetting the occupied nodes
            handleCompNodes(component) // Updating the nodes
            setOccupied(component) // Setting the new occupied nodes (these 3 steps are necessary in case of any type of rotation)
            const shownText = document.getElementById('showtext');
            if (shownText.value == 'true')
                component.shownText = true;
            else if (shownText.value == 'false')
                component.shownText = false;
            popupDiv.remove();
            updateText(component, text) // updating the component text after getting all the user input and validating
            layer.batchDraw();
        })
    })
}

//========================================Dragend Handler Helper Function==========================================
export function dragendHandler(component, newcoords, currcoords) {
    if (checkNearby(component, newcoords)) {
        component.position({ x: currcoords[0], y: currcoords[1] }); // undo the position shift
        updateText(component, component.text); // update the component text
        return;
    }
    unsetOccupied(component)
    // update the currcoords array and the position of the component according to the grid system
    currcoords[0] = newcoords[0]
    currcoords[1] = newcoords[1]
    component.position({ x: currcoords[0], y: currcoords[1] });
    handleCompNodes(component); // update the component nodes
    setOccupied(component);
    updateText(component); // update the component text
}
//========================================Component Nodes Handler Function==========================================
export function handleCompNodes(component) { // Updates the component nodes
    const rotation = component.rotation();
    if (rotation === 0) {
        let node1_index = getIndex(component.x() - component.width() / 2, component.y());
        let node2_index = getIndex(component.x() + component.width() / 2, component.y());
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
    }
    else if (rotation === 90) {
        let node1_index = getIndex(component.x(), component.y() - component.height() / 2);
        let node2_index = getIndex(component.x(), component.y() + component.height() / 2);
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
    }
    else if (rotation === 180) {
        let node1_index = getIndex(component.x() + component.width() / 2, component.y());
        let node2_index = getIndex(component.x() - component.width() / 2, component.y());
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
    }
    else if (rotation === 270) {
        let node1_index = getIndex(component.x(), component.y() + component.height() / 2);
        let node2_index = getIndex(component.x(), component.y() - component.height() / 2);
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
    }
}
//========================================Component Text Update Function==========================================
export function updateText(component) {
    if (component.dependent) {
        component.text.text(`${component.name}`);
    }
    else {
        component.text.text(`${component.name} ${component.getValue()}${component.prefix === " " ? '' : component.prefix}${component.unit} `);
    }
    component.text.offsetX(component.text.width() / 2)
    component.text.offsetY(component.text.height() / 2)
    component.text.rotation(component.rotation());
    if (component.rotation() === 0) {
        component.text.position({ x: component.x(), y: component.y() - 40 })
    }
    else if (component.rotation() === 90) {
        component.text.position({ x: component.x() + 40, y: component.y() })
    }
    else if (component.rotation() === 180) {
        component.text.position({ x: component.x(), y: component.y() + 40 })
    }
    else if (component.rotation() === 270) {
        component.text.position({ x: component.x() - 40, y: component.y() })
    }
    component.text.hide();
    if (component.shownText)
        component.text.show();
}
//========================================Remove Component Handler Function==========================================
function removeComponent(component) {
    let currNum = 1;
    components.forEach((currComponent) => { // Update the components names after deleting the component
        if (currComponent !== null && currComponent.type === component.type && currComponent !== component) {
            if (currComponent.name !== `${currComponent.getSymbol()}${currNum++} `) { // Check if the name needs to be updated
                currComponent.name = `${currComponent.getSymbol()}${currNum - 1} `;
                currComponent.text.text(`${currComponent.name} ${currComponent.getValue()}${currComponent.prefix === " " ? '' : currComponent.prefix}${currComponent.unit} `);
            }
        }
    })
    component.decreaseCount(); // Decrease the static counter in the class
    components[component.ID] = null; // nullify the component in the components array
    component.text.remove();
    component.remove();
}
//========================================Dragging Toggling Functions==========================================
export function disableDragging() {
    components.forEach((comp) => {
        if (comp === null) return;
        comp.draggable(false); // Set the draggable attribut to false for all the components
    })
    ground.draggable(false); // and the ground
}
export function enableDragging() {
    components.forEach((comp) => {
        if (comp === null) return;
        comp.draggable(true) // Set the draggable attribute to true for all the components
    })
    ground.draggable(true); // and the ground
}
//========================================Draw Nodes Function==========================================
export function drawNodes() { // This function draws clickable nodes for the user (useful for adding wires)
    const groundNode = new Konva.Circle({
        x: ground.node.position.x,
        y: ground.node.position.y,
        radius: 4,
        fill: "#772F1A"
    })
    nodeCircles.push(groundNode); // Adding the ground node-drawn node to the nodeCircles array for looping over all nodes
    components.forEach((currComponent) => {
        if (currComponent == null) return;
        const node1 = new Konva.Circle({
            x: currComponent.node1.position.x,
            y: currComponent.node1.position.y,
            radius: 4,
            fill: '#772F1A',
        });
        nodeCircles.push(node1); // Adding both the component's nodes to the array
        const node2 = new Konva.Circle({
            x: currComponent.node2.position.x,
            y: currComponent.node2.position.y,
            radius: 4,
            fill: '#772F1A',
        });
        nodeCircles.push(node2);
    })
    wires.forEach((wire) => {
        if (wire == null) return;
        wire.gridPoints.forEach((point) => {
            let newNode = true;
            nodeCircles.forEach((node) => {
                if (node.x() == point.position.x && node.y() == point.position.y) newNode = false; // checking if the node is added already
            })
            if (!newNode) return;
            const node = new Konva.Circle({
                x: point.position.x,
                y: point.position.y,
                radius: 4,
                fill: '#772F1A'
            })
            nodeCircles.push(node);
        });
    })
    // changing the cursor to pointer when hovering over the nodes
    nodeCircles.forEach((node) => {
        node.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
        })
        node.on('mouseout', () => {
            document.body.style.cursor = 'default';
        })
        node.on('click', () => { // Changing node color to green on click
            node.fill('green')
        })
        layer.add(node)
    })
    layer.batchDraw();
}
//========================================Remove Nodes Function==========================================
export function removeNodes() { // Removes the drawn nodes and clears the nodeCircles array
    nodeCircles.forEach((node) => {
        node.remove();
    })
    nodeCircles = [];
    layer.batchDraw();
}
//========================================A* algorithm==========================================
export function heuristic(startNode, endNode) { // Helper function that calculates the heuristic to goal
    return Math.abs(startNode.x - endNode.x) + Math.abs(startNode.y - endNode.y);
}

export function reconstructPath(node) { // Helper function that constructs the path from the start node to end node
    let path = [];
    while (node) {
        path.push(node);
        node = node.parent;
    }
    return path.reverse(); // Reverse the path to start-to-end order
}

export function aStar(startNode, endNode) {
    let openSet = [startNode]; // Nodes to explore
    let closedSet = []; // Nodes already explored

    nodes.forEach(node => {
        node.g = Infinity; // Cost to reach this node (default: Infinity)
        node.h = 0; // Heuristic cost estimate (default: 0)
        node.f = node.g + node.h; // Total estimated cost
        node.parent = null; // Track the path
    });
    startNode.g = 0; // Cost to reach the start node is 0
    startNode.h = heuristic(startNode.position, endNode.position); // Heuristic to goal
    startNode.f = startNode.g + startNode.h; // Total estimated cost

    while (openSet.length > 0) {
        // Find the node in openSet with the lowest f value
        let currentNode = openSet.reduce((a, b) => (a.f < b.f ? a : b));

        // If we reached the goal node, reconstruct the path
        if (currentNode === endNode) {
            return reconstructPath(currentNode);
        }

        // Remove currentNode from openSet and add it to closedSet
        openSet = openSet.filter(node => node !== currentNode);
        closedSet.push(currentNode);

        // Explore all neighbors of the currentNode
        ["left", "top", "right", "bottom"].forEach(dir => {
            if (!currentNode[dir]) return;
            let neighbor = nodes[currentNode[dir].index];
            if (!neighbor || neighbor.occupied || closedSet.includes(neighbor)) {
                return;
            }

            // Calculate the tentative g score
            let tentativeG = currentNode.g + 1; // Assuming uniform cost for each step

            // If the neighbor is not in openSet, add it
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeG >= neighbor.g) {
                return; // If the new path is not better (or worse), avoid going backward toward the start node
            }

            // Update the neighbor's g, h, f values and set its parent
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor.position, endNode.position);
            neighbor.f = neighbor.g + neighbor.h;
            neighbor.parent = currentNode; // Set the parent to track the path
        });
    }

    // If we exhaust the openSet without finding the goal, return null (no path found)
    return null;
}
//========================================Draw Wire Function==========================================
export function drawWire(clickedNodes) {
    let node1_index = getIndex(clickedNodes[0].x(), clickedNodes[0].y());
    let node2_index = getIndex(clickedNodes[1].x(), clickedNodes[1].y())
    nodeCircles.forEach((node) => {
        let nodeIdx = getIndex(node.x(), node.y());
        if (nodeIdx != node1_index && nodeIdx != node2_index) nodes[nodeIdx].occupied = true; // Set every node that has a wire or a component other than the start and end nodes as occupied
    })
    let wireNodes = aStar(nodes[node1_index], nodes[node2_index]);
    if (!wireNodes) return false;
    let wire = new Wire();
    wire.gridPoints = wireNodes;
    for (let i = 0; i < wireNodes.length - 1; i++) { // Draw the wire
        const line = new Konva.Line({
            points: [wireNodes[i].position.x, wireNodes[i].position.y, wireNodes[i + 1].position.x, wireNodes[i + 1].position.y],
            stroke: 'black',
            strokeWidth: 2,
            listening: true,
        });
        layer.add(line);
        wire.drawnLines.push(line);
    }
    wires.push(wire); // Add the wire to the wires array
    nodeCircles.forEach((node) => {
        let nodeIdx = getIndex(node.x(), node.y());
        nodes[nodeIdx].occupied = false; // Unoccupy the nodes
    })
    removeNodes();
    wire.drawnLines.forEach((line) => { // Adding event listeners to delete wire on double click on any line of the wire
        line.on('dblclick', () => {
            console.log(wires);
            if (addingWire) return;
            wire.drawnLines.forEach((line) => {
                line.remove();
            })
            wires[wire.ID] = null;
        })
    })
    return true;
}
//========================================Update Nodes Function==========================================
function haveCommonNodes(node1, node2) { // Helper function to avoid repeating nodes
    const keys1 = Object.keys(node1);
    const keys2 = Object.keys(node2);
    const set1 = new Set(keys1);

    for (const key of keys2) {
        if (set1.has(key)) {
            return true;
        }
    }
    return false;
}

function updateNodes() { // Helper function to generate the nodes for the net list
    uniqueNodes = {}
    nodeCounter = 1;
    wires.forEach((wire) => { // Each wire is a single node
        if (wire == null) return;
        for (let i = 1; i < nodeCounter; i++) {
            for (let j = 0; j < wire.gridPoints.length; j++) {
                if (uniqueNodes[`N${i} `][`${wire.gridPoints[j].index} `]) { // Check if two wires overlap at some node
                    for (let k = 0; k < wire.gridPoints.length; k++) {
                        uniqueNodes[`N${i} `][`${wire.gridPoints[k].index} `] = true;
                    }
                    return;
                }
            }
        }
        if (!uniqueNodes[`N${nodeCounter} `]) uniqueNodes[`N${nodeCounter} `] = {}; // Check if the wire is a new node
        for (let i = 0; i < wire.gridPoints.length; i++) {
            uniqueNodes[`N${nodeCounter} `][`${wire.gridPoints[i].index} `] = true;
        }
        nodeCounter++;
    })
    for (let i = 1; i < nodeCounter; i++) {
        for (let j = i + 1; j < nodeCounter; j++) {
            if (haveCommonNodes(uniqueNodes[`N${i} `], uniqueNodes[`N${j} `])) { // Check if two nodes have common points
                uniqueNodes[`N${i} `] = { ...uniqueNodes[`N${i} `], ...uniqueNodes[`N${j} `] } // Make one node that holds both
                let k = j
                nodeCounter--;
                for (; k < nodeCounter; k++) {
                    uniqueNodes[`N${k} `] = uniqueNodes[`N${k + 1} `] // Update the nodes to avoid redundancy
                }
                delete uniqueNodes[`N${k} `]; // Delete the last entry from the uniqueNodes object
            }
        }
    }

    components.forEach((component) => {
        if (component == null) return
        let node1Defined = false;
        let node2Defined = false;
        for (let i = 1; i < nodeCounter; i++) { // Validate whether the nodes around a component are connected by wires or not
            if (uniqueNodes[`N${i} `][`${component.node1.index} `]) {
                node1Defined = true;
            }
            if (uniqueNodes[`N${i} `][`${component.node2.index} `]) {
                node2Defined = true;
            }
        }
        if (!node1Defined) { // If not define a new node
            uniqueNodes[`N${nodeCounter} `] = {};
            uniqueNodes[`N${nodeCounter} `][`${component.node1.index} `] = true;
            nodeCounter++;
        }
        if (!node2Defined) {
            uniqueNodes[`N${nodeCounter} `] = {};
            uniqueNodes[`N${nodeCounter} `][`${component.node2.index} `] = true;
            nodeCounter++;
        }
    })
    for (let i = 1; i < nodeCounter; i++) { // Check if a defined node is ground
        if (uniqueNodes[`N${i} `][`${ground.node.index} `]) {
            uniqueNodes['GND'] = uniqueNodes[`N${i} `];
            let j = i
            for (; j < nodeCounter - 1; j++) {
                uniqueNodes[`N${j} `] = uniqueNodes[`N${j + 1} `]
            }
            delete uniqueNodes[`N${j} `];
            nodeCounter--;
            break;
        }
    }
    if (!uniqueNodes['GND']) { // If ground isn't defined, define it
        uniqueNodes['GND'] = {};
        uniqueNodes['GND'][`${ground.node.index} `] = true;
    }
}
//========================================Generate Net list Function==========================================
export function genNetList() {
    updateNodes();
    let netList = [];
    components.forEach((component) => {
        if (component === null) return;
        let node1, node2;
        for (const key of Object.keys(uniqueNodes)) {
            if (uniqueNodes[key][`${component.node1.index} `]) node1 = key;
        }
        for (const key of Object.keys(uniqueNodes)) {
            if (uniqueNodes[key][`${component.node2.index} `]) node2 = key;
        }
        let listObj = {};
        if (component.dependent) {
            let dependComp = null;
            let dependNode1 = 'none';
            let dependNode2 = 'none';
            console.log(parseInt(component.dependency));
            if (math.isNumber(parseInt(component.dependency)))
                dependComp = components[parseInt(component.dependency)]
            console.log(dependComp)
            if (!dependComp) gain = 0;
            else {
                gain = component.gain;
                for (const key of Object.keys(uniqueNodes)) {
                    if (uniqueNodes[key][`${dependComp.node1.index} `]) dependNode1 = key;
                }
                for (const key of Object.keys(uniqueNodes)) {
                    if (uniqueNodes[key][`${dependComp.node2.index} `]) dependNode2 = key;
                }
            }
            listObj = { name: component.name, type: component.getSymbol(), Node1: node1, Node2: node2, Gain: gain, exponent: getExponent(component.prefix), dependent: true, Dependnode1: dependNode1, Dependnode2: dependNode2, dependencyType: component.controlsource } // Genereate netlist entries
        }
        else
            listObj = { name: component.name, type: component.getSymbol(), Node1: node1, Node2: node2, Value: component.value, exponent: getExponent(component.prefix), dependent: false } // Genereate netlist entries
        netList.push(listObj)
    })
    const numberOfNodes = Object.keys(uniqueNodes).length - 1; // Ground node isn't counted as a node
    let voltageSourceCount = 0;
    let voltageSourceIndeces = [];
    let voltageSources = [];
    for (let i = 0; i < netList.length; i++) {
        if (netList[i].type === 'Vs' || netList[i].type === 'DVs') {
            voltageSourceCount++;
            if (netList[i].dependencyType === ControlSource.CURRENT) voltageSourceCount++;
            voltageSourceIndeces.push(i);
            voltageSources.push(netList[i].name);
        };
    }
    const matrixSize = numberOfNodes + voltageSourceCount; // MNA matrix
    let gMatrix = new Array(matrixSize)
    let iMatrix = new Array(matrixSize);
    iMatrix.fill(0); // Matrices are initialized to zero to update the values later
    for (let i = 0; i < matrixSize; i++) {
        gMatrix[i] = new Array(matrixSize);
        gMatrix[i].fill(0);
    }
    for (let i = 0; i < netList.length; i++) {
        if (netList[i].type === 'R') {
            let node1 = parseInt(netList[i].Node1.slice(1)) // ignore the 'N' in 'Nxx'
            let node2 = parseInt(netList[i].Node2.slice(1))
            if (!Number.isNaN(node1)) { // Check if the node isn't GND
                gMatrix[node1 - 1][node1 - 1] += 1 / (parseFloat(netList[i].Value) * netList[i].exponent);
            }
            if (!Number.isNaN(node2)) {
                gMatrix[node2 - 1][node2 - 1] += 1 / (parseFloat(netList[i].Value) * netList[i].exponent);
            }
            if (!Number.isNaN(node1) && !Number.isNaN(node2)) {
                gMatrix[node1 - 1][node2 - 1] -= 1 / (parseFloat(netList[i].Value) * netList[i].exponent);
                gMatrix[node2 - 1][node1 - 1] -= 1 / (parseFloat(netList[i].Value) * netList[i].exponent);
            }
        }
        else if (netList[i].type === 'Cs') {
            let node1 = parseInt(netList[i].Node1.slice(1))
            let node2 = parseInt(netList[i].Node2.slice(1))
            if (!Number.isNaN(node1)) {
                iMatrix[node1 - 1] += parseFloat(netList[i].Value * netList[i].exponent);
            }
            if (!Number.isNaN(node2)) {
                iMatrix[node2 - 1] -= parseFloat(netList[i].Value * netList[i].exponent);
            }
        }
        else if (netList[i].type === 'DCs') {
            let node1 = parseInt(netList[i].Node1.slice(1))
            let node2 = parseInt(netList[i].Node2.slice(1))
            let dependentnode1 = parseInt(netList[i].Dependnode1.slice(1));
            let dependentnode2 = parseInt(netList[i].Dependnode2.slice(1));
            if (!Number.isNaN(node1)) {
                if (!Number.isNaN(dependentnode1)) gMatrix[node1 - 1][dependentnode1 - 1] -= parseFloat(netList[i].Gain * netList[i].exponent);
                if (!Number.isNaN(dependentnode2)) gMatrix[node1 - 1][dependentnode2 - 1] += parseFloat(netList[i].Gain * netList[i].exponent);
            }
            if (!Number.isNaN(node2)) {
                if (!Number.isNaN(dependentnode1)) gMatrix[node2 - 1][dependentnode1 - 1] += parseFloat(netList[i].Gain * netList[i].exponent);
                if (!Number.isNaN(dependentnode2)) gMatrix[node2 - 1][dependentnode2 - 1] -= parseFloat(netList[i].Gain * netList[i].exponent);
            }
        }
    }
    let skipEntries = [];
    for (let i = 0; i < voltageSourceIndeces.length; i++) {
        const currentVSource = netList[voltageSourceIndeces[i]];
        let node1 = parseInt(currentVSource.Node1.slice(1));
        let node2 = parseInt(currentVSource.Node2.slice(1));
        if (!Number.isNaN(node1)) {
            gMatrix[node1 - 1][numberOfNodes + i + skipEntries.length] += 1;
            gMatrix[numberOfNodes + i + skipEntries.length][node1 - 1] += 1;
        }
        if (!Number.isNaN(node2)) {
            gMatrix[node2 - 1][numberOfNodes + i + skipEntries.length] -= 1;
            gMatrix[numberOfNodes + i + skipEntries.length][node2 - 1] -= 1;
        }
        if (currentVSource.dependent === true) {
            if (currentVSource.dependencyType === ControlSource.VOLTAGE) {
                let dependentnode1 = parseInt(currentVSource.Dependnode1.slice(1));
                let dependentnode2 = parseInt(currentVSource.Dependnode2.slice(1));
                if (!Number.isNaN(dependentnode1)) {
                    gMatrix[numberOfNodes + i + skipEntries.length][dependentnode1 - 1] -= parseFloat(currentVSource.Gain * currentVSource.exponent);
                }
                if (!Number.isNaN(dependentnode2)) {
                    gMatrix[numberOfNodes + i + skipEntries.length][dependentnode2 - 1] += parseFloat(currentVSource.Gain * currentVSource.exponent);
                }
            }
            else {
                let dependentnode1 = parseInt(currentVSource.Dependnode1.slice(1));
                let dependentnode2 = parseInt(currentVSource.Dependnode2.slice(1));
                if (!Number.isNaN(dependentnode1)) {
                    gMatrix[numberOfNodes + i + skipEntries.length + 1][dependentnode1 - 1] += 1;
                    gMatrix[dependentnode1 - 1][numberOfNodes + i + skipEntries.length + 1] += 1;
                }
                if (!Number.isNaN(dependentnode2)) {
                    gMatrix[numberOfNodes + i + skipEntries.length + 1][dependentnode2 - 1] -= 1;
                    gMatrix[dependentnode2 - 1][numberOfNodes + i + skipEntries.length + 1] -= 1;
                }
                gMatrix[numberOfNodes + i + skipEntries.length][numberOfNodes + i + skipEntries.length + 1] -= parseFloat(currentVSource.Gain * currentVSource.exponent);
                skipEntries.push(numberOfNodes + i + skipEntries.length + 1);
            }
        }
        else
            iMatrix[numberOfNodes + i + skipEntries.length] += parseFloat(currentVSource.Value * currentVSource.exponent);
    }
    console.log(gMatrix);
    let outputValues;
    try {
        outputValues = math.lusolve(gMatrix, iMatrix);
    } catch (error) {
        alert("current circuit can't be solved");
        return;
    }

    let nodeColors = [];
    for (let i = 0; i < outputValues.length - voltageSourceCount; i++) {
        let nodeIdx = parseInt(Object.keys(uniqueNodes[`N${i + 1} `])[0]);
        let curr = nodes[nodeIdx]
        let currFill = randomColor(nodeColors); // Add Circles with random generated colors on the circuit clarifying the output nodes
        const node = new Konva.Circle({
            x: curr.position.x,
            y: curr.position.y,
            radius: 4,
            fill: currFill
        })
        layer.add(node);
        nodeColors.push(currFill);
        outputNodes.push(node);
    }
    drawTable(outputValues, voltageSources, nodeColors, skipEntries)
    layer.batchDraw()
}
//========================================Get Exponent Function==========================================
function getExponent(prefix) {
    switch (prefix) {
        case 'p': // pico
            return Math.pow(10, -12);
        case 'n': // nano
            return Math.pow(10, -9);
        case 'µ': // micro
            return Math.pow(10, -6);
        case 'm': // milli
            return Math.pow(10, -3);
        case 'c': // centi
            return Math.pow(10, -2);
        case ' ': // no prefix, base unit
            return Math.pow(10, 0);
        case 'k': // kilo
            return Math.pow(10, 3);
        case 'M': // mega
            return Math.pow(10, 6);
        case 'G': // giga
            return Math.pow(10, 9);
        case 'T': // tera
            return Math.pow(10, 12);
        default:
            throw new Error(`Unknown prefix: ${prefix} `);
    }
}
//========================================Generate Random unique Color for nodes Function==========================================
function randomColor(nodeColors) {
    const getRandomDarkColor = () => {
        // Generate random RGB values in the range (0-128) for a dark color
        const r = Math.floor(Math.random() * 128); // 0 to 128
        const g = Math.floor(Math.random() * 128); // 0 to 128
        const b = Math.floor(Math.random() * 128); // 0 to 128

        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} `;
    };

    let newColor;

    do {
        newColor = getRandomDarkColor();
    } while (nodeColors.includes(newColor)); // Repeat until a unique color is found

    return newColor;
}
//========================================Format Output Function==========================================
function formatOutput(value) {
    if (Math.abs(Number(value)) >= 1e12) {
        // Teras (T)
        return (Number(value) / 1e12).toFixed(3) + ' T';
    } else if (Math.abs(Number(value)) >= 1e9) {
        // Gigas (G)
        return (Number(value) / 1e9).toFixed(3) + ' G';
    } else if (Math.abs(Number(value)) >= 1e6) {
        // Megas (M)
        return (Number(value) / 1e6).toFixed(3) + ' M';
    } else if (Math.abs(Number(value)) >= 1e3) {
        // Kilos (k)
        return (Number(value) / 1e3).toFixed(3) + ' k';
    } else if (Math.abs(Number(value)) >= 1) {
        // Base unit
        return Number(value).toFixed(3);
    } else if (Math.abs(Number(value)) >= 1e-3) {
        // Millis (m)
        return (Number(value) * 1e3).toFixed(3) + ' m';
    } else if (Math.abs(Number(value)) >= 1e-6) {
        // Micros (μ)
        return (Number(value) * 1e6).toFixed(3) + ' μ';
    } else if (Math.abs(Number(value)) >= 1e-9) {
        // Nanos (n)
        return (Number(value) * 1e9).toFixed(3) + ' n';
    } else if (Math.abs(Number(value)) >= 1e-12) {
        // Picos (p)
        return (Number(value) * 1e12).toFixed(3) + ' p';
    } else {
        // Too small to format meaningfully
        return '0.000';
    }
}
//========================================Draw Table Function==========================================
export function drawTable(outputValues, voltageSources, nodeColors, skipEntries) {
    const firstColcellWidth = 150;
    const SecondColcellWidth = 100;
    const cellHeight = 40;
    console.log(voltageSources)
    const voltageSourceCount = voltageSources.length;
    // Create a group for the table
    const tableGroup = new Konva.Group({
        x: 50,
        y: 50,
        draggable: true // Make the group draggable
    });

    const rect = new Konva.Rect({
        x: 50,
        y: 50,
        width: firstColcellWidth,
        height: cellHeight,
        fill: 'lightgray',
        stroke: 'black',
        strokeWidth: 1
    });
    tableGroup.add(rect);
    const text = new Konva.Text({
        x: 50 + 10, // padding
        y: 50 + 10, // padding
        text: 'Circuit Parameters',
        fontSize: 16,
        fontFamily: 'Calibri',
        fill: 'black'
    });
    tableGroup.add(text);
    const rect2 = new Konva.Rect({
        x: 50 + firstColcellWidth,
        y: 50,
        width: SecondColcellWidth,
        height: cellHeight,
        fill: 'lightgray',
        stroke: 'black',
        strokeWidth: 1
    });
    tableGroup.add(rect2);
    const text2 = new Konva.Text({
        x: 50 + firstColcellWidth + 10, // padding
        y: 50 + 10, // padding
        text: 'Value',
        fontSize: 16,
        fontFamily: 'Calibri',
        fill: 'black'
    });
    tableGroup.add(text2);
    for (let i = 0; i < outputValues.length - (voltageSourceCount + skipEntries.length); i++) { // Add the node Voltages to the table
        const node = new Konva.Rect({
            x: 50,
            y: (i + 1) * cellHeight + 50,
            width: firstColcellWidth,
            height: cellHeight,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
        });
        tableGroup.add(node);
        const nodeName = new Konva.Text({
            x: 50 + 10, // padding
            y: (i + 1) * cellHeight + 60, // padding
            text: `V${i + 1} `,
            fontSize: 16,
            fontFamily: 'Calibri',
            fill: nodeColors[i] // Colored the same as the corresponding node on the circuit
        });
        tableGroup.add(nodeName);
        const nodeVal = new Konva.Rect({
            x: 50 + firstColcellWidth,
            y: 50 + (i + 1) * cellHeight,
            width: SecondColcellWidth,
            height: cellHeight,
            fill: 'white', // Header row color
            stroke: 'black',
            strokeWidth: 1
        });
        tableGroup.add(nodeVal);
        const nodeValTxt = new Konva.Text({
            x: 50 + firstColcellWidth + 10, // padding
            y: (i + 1) * cellHeight + 60, // padding
            text: `${formatOutput(outputValues[i])} V`,
            fontSize: 16,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        tableGroup.add(nodeValTxt);
    }
    let actualCount = 0;
    let skipped = 0;
    for (let i = outputValues.length - (voltageSourceCount + skipEntries.length); i < outputValues.length; i++) { // Add the currents through the voltage sources
        if (skipEntries.includes(i)) { skipped++; continue; }
        const branch = new Konva.Rect({
            x: 50,
            y: (i + 1 - skipped) * cellHeight + 50,
            width: firstColcellWidth,
            height: cellHeight,
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
        });
        tableGroup.add(branch);
        const branchName = new Konva.Text({
            x: 50 + 10, // padding
            y: (i + 1 - skipped) * cellHeight + 60, // padding
            text: `I through ${voltageSources[i - (outputValues.length - (voltageSourceCount + skipEntries.length))]} `,
            fontSize: 16,
            fontFamily: 'Calibri',
            fill: 'black' // Colored the same as the corresponding node on the circuit
        });
        tableGroup.add(branchName);
        const currentVal = new Konva.Rect({
            x: 50 + firstColcellWidth,
            y: 50 + (i + 1 - skipped) * cellHeight,
            width: SecondColcellWidth,
            height: cellHeight,
            fill: 'white', // Header row color
            stroke: 'black',
            strokeWidth: 1
        });
        tableGroup.add(currentVal);
        const current = new Konva.Text({
            x: 50 + firstColcellWidth + 10, // padding
            y: (i + 1 - skipped) * cellHeight + 60, // padding
            text: `${formatOutput(outputValues[i])} A`,
            fontSize: 16,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        tableGroup.add(current);
        actualCount++;
    }
    layer.add(tableGroup);
    stage.on('click', (e) => {
        // Get the bounding box of the group
        const rect = tableGroup.getClientRect();

        // Get click position
        const clickX = e.evt.clientX;
        const clickY = e.evt.clientY;

        // Check if the click is inside the bounding box
        const isInsideGroup = (
            clickX >= rect.x &&
            clickX <= rect.x + rect.width &&
            clickY >= rect.y &&
            clickY <= rect.y + rect.height
        );

        if (!isInsideGroup) {
            outputNodes.forEach(node => node.remove())
            tableGroup.remove();
            outputNodes = [];
        }
    });
}
//========================================Helper Functions End==========================================