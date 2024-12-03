import { Ground, Wire } from './classes';
import Konva from 'konva'
const math = require('mathjs')

let width = window.innerWidth
let height = window.innerHeight
//let addingWire = false;

export var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
})
export let layer = new Konva.Layer();
export const GRIDSIZE = 30;
export let components = []; // component != null
export let ground = null;
export let nodeCircles = []; // A list of the drawn circles about each node
export let wires = []; // A list of all the wire generated
export let nodes = []; // All the nodes within the active program
export let addingWire = false;
let uniqueNodes = {};
let nodeCounter = 1;
export function setAddingWire(value) {
    addingWire = value;
}

export function getAddingWire() {
    return addingWire;
}
//========================================Add Component SVG Function==========================================
export function addCompSVG(image, svg) {
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

//========================================Grid Drawing Function==========================================
export function drawGrid(stage, layer, gridSize) {
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
    for (let y = 0; y <= height; y += gridSize) {
        for (let x = 0; x <= width; x += gridSize) {
            const circle = new Konva.Circle({
                x: x,
                y: y,
                radius: 1,
                fill: 'darkgray',
                listening: false,
            });
            layer.add(circle);
            // Generate Graph
            if (x > 0 && y > 0) {
                let node = {};

                let rownumberofNodes = parseInt((width - GRIDSIZE) / GRIDSIZE)
                let currentRow = (y - GRIDSIZE) / GRIDSIZE
                node.index = (x - GRIDSIZE) / GRIDSIZE + (currentRow * (rownumberofNodes + 1))

                node.occupied = false;
                node.position = { x: x, y: y };
                if (x !== GRIDSIZE) {
                    node.left = { index: (x - 2 * GRIDSIZE) / GRIDSIZE + (currentRow * (rownumberofNodes + 1)) }
                }
                if (y !== GRIDSIZE) {
                    node.top = { index: (x - GRIDSIZE) / GRIDSIZE + ((currentRow - 1) * (rownumberofNodes + 1)) };
                }
                if (x !== width - GRIDSIZE) {
                    node.right = { index: x / GRIDSIZE + (currentRow * (rownumberofNodes + 1)) }
                }
                if (y !== height - GRIDSIZE) {
                    node.bottom = { index: (x - GRIDSIZE) / GRIDSIZE + ((currentRow + 1) * (rownumberofNodes + 1)) }
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
    imageObj.onload = function () {
        const width = stage.width();
        let rownumberofNodes = parseInt((width - GRIDSIZE) / GRIDSIZE)
        let compRow = (60 - GRIDSIZE) / GRIDSIZE
        var groundElement = new Ground({})
        groundElement.x(snapToGrid(width - 60));
        groundElement.y(60);
        groundElement.image(imageObj);
        groundElement.width(GRIDSIZE * 2);
        groundElement.draggable(true);
        groundElement.rotation(0);
        groundElement.offsetX(groundElement.width() / 2)
        let nodeIdx = parseInt((groundElement.x() + groundElement.offsetX() - GRIDSIZE) / GRIDSIZE + (compRow * (rownumberofNodes)))
        groundElement.node = nodes[nodeIdx];
        nodes[groundElement.node.bottom.index].occupied = true;
        layer.add(groundElement)
        ground = groundElement;
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
                groundElement.position({ x: currcoords[0], y: currcoords[1] });
                layer.batchDraw();
            }
            else {
                nodes[groundElement.node.bottom.index].occupied = false;
                currcoords[0] = newcoords[0]
                currcoords[1] = newcoords[1]
                groundElement.position({ x: currcoords[0], y: currcoords[1] });
                let newNodeRow = (groundElement.y() - GRIDSIZE) / GRIDSIZE
                let newNodeIdx = ((groundElement.x()) - GRIDSIZE) / GRIDSIZE + (newNodeRow * (rownumberofNodes + 1))
                groundElement.node = nodes[newNodeIdx];
                nodes[groundElement.node.bottom.index].occupied = true;
            }
        })
    }
}
//========================================Show Component details Function==========================================
export function showDetails(component) {
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
//========================================Check Nearby Components Function==========================================
export function checkNearby(component, newcoords) {
    if (newcoords[0] < 60 || Math.abs(width - newcoords[0]) < 60 || newcoords[1] < 60 || Math.abs(height - newcoords[1]) < 60) {
        return true;
    }
    if (component !== ground) {
        let boundGndx = Math.abs(ground.x() - newcoords[0])
        let boundGndy = Math.abs(ground.y() - newcoords[1])
        if (component.horizontal) {
            if (boundGndx <= 90 && boundGndy <= 30) {
                return true;
            }
        }
        else if (!component.horizontal) {
            if (boundGndx <= 30 && boundGndy <= 90) {
                return true;
            }
        }
    }
    for (const curr of components) {
        if (curr == null || component.ID == curr.ID) {
            continue;
        }
        let currx = curr.x();
        let curry = curr.y();
        let boundx = Math.abs(currx - newcoords[0]);
        let boundy = Math.abs(curry - newcoords[1])
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
    return false;
}
export function checkNearbybyCoords(coords) {
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
    const width = stage.width();
    let rownumberofNodes = parseInt((width - GRIDSIZE) / GRIDSIZE)
    let compRow = (90 - GRIDSIZE) / GRIDSIZE;
    let node1_index = parseInt((75 - GRIDSIZE) / GRIDSIZE + (compRow * (rownumberofNodes)) + 1)
    let node2_index = parseInt((165 - GRIDSIZE) / GRIDSIZE + (compRow * (rownumberofNodes)) + 1)
    component.x(75);
    component.y(90);
    component.image(image);
    component.width(GRIDSIZE * 3);
    component.draggable(true);
    component.rotation(0);
    component.offsetX(component.width() / 2)
    component.offsetY(component.height() / 2)
    console.log(node1_index)
    component.node1 = nodes[node1_index]
    component.node2 = nodes[node2_index]
    nodes[component.node1.right.index].occupied = true;
    nodes[nodes[component.node1.right.index].right.index].occupied = true;
}
//========================================Component Text Initialzier Function==========================================
export function initializeComptext(component) {
    const text = new Konva.Text({
        x: component.x(), // Center the text above the resistance
        y: component.y() - 40, // Position it above the resistance
        text: `${component.name} ${component.getValue()} ${component.unit}`,
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
//========================================Component Handler Function==========================================
export function componentHandler(component, text) {
    component.text = text;
    layer.add(component)
    components.push(component);
    layer.add(component.text)
    layer.draw();
    let currcoords = [component.x(), component.y()]
    component.on('dragstart', () => {
        component.text.hide();
    });
    component.on('dragend', () => {
        let newcoords = [];
        if (component.horizontal) {
            newcoords = [snapToGrid(component.x()) - 15, snapToGrid(component.y())];
        } else {
            newcoords = [snapToGrid(component.x()), snapToGrid(component.y()) - 15];
        }
        dragendHandler(component, newcoords, currcoords)
        //component.text.show();
        layer.batchDraw();
    });
    component.on('dblclick', () => {
        if (addingWire) return;
        showDetails(component);
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
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                popupDiv.remove();
            }
        })
        deleteBtn.addEventListener('click', () => {
            popupDiv.remove();
            removeComponent(component);
            text.remove();
            layer.batchDraw();
        })

        submitBtn.addEventListener('click', () => {
            const componentval = document.getElementById('componentval');
            const prefix = document.getElementById('prefix');
            const rotation = document.getElementById('rotation');
            component.setValue(componentval.value);
            component.setPrefix(prefix.value);
            if (!component.node1Connected && !component.node2Connected) {
                let previousOrient = component.horizontal;
                let previousRotation = component.rotation();
                component.setRotationvalue(rotation.value);
                if ((previousRotation == component.rotation()) || (Math.abs(previousRotation - component.rotation()) == 180)) { }
                else if (component.rotation() === 0 || component.rotation() === 180) {
                    component.horizontal = true;
                    if (checkNearby(component, [snapToGrid(component.x()) - 15, snapToGrid(component.y())])) {
                        component.horizontal = false;
                        component.setRotationvalue(previousRotation);
                        const norotate = document.getElementById('norotate');
                        norotate.style.display = 'block'
                        setTimeout(() => {
                            norotate.style.display = 'none';
                        }, 2000)
                    } else {
                        if (!previousOrient)
                            component.position({ x: snapToGrid(component.x()) - 15, y: snapToGrid(component.y()) })
                        currcoords = [component.x(), component.y()];
                    }
                }
                else {
                    component.horizontal = false;
                    if (checkNearby(component, [snapToGrid(component.x()), snapToGrid(component.y()) - 15])) {
                        component.horizontal = true;
                        component.setRotationvalue(previousRotation);
                        const norotate = document.getElementById('norotate');
                        norotate.style.display = 'block'
                        setTimeout(() => {
                            norotate.style.display = 'none';
                        }, 2000)
                    }
                    else {
                        if (previousOrient)
                            component.position({ x: snapToGrid(component.x()), y: snapToGrid(component.y()) - 15 })
                        currcoords = [component.x(), component.y()];
                    }
                }
                updateText(component, text)
                unsetOccupied(component)
                handleCompNodes(component)
                setOccupied(component)
            }
            else {
                const disconnect = document.getElementById('disconnect');
                disconnect.style.display = 'block'
                setTimeout(() => {
                    disconnect.style.display = 'none';
                }, 2000)
            }
            const shownText = document.getElementById('showtext');
            if (shownText.value == 'true')
                component.shownText = true;
            else if (shownText.value == 'false')
                component.shownText = false;
            popupDiv.remove();
            updateText(component, text)
            layer.batchDraw();
        })
    })
}

//========================================Dragend Handler Helper Function==========================================
export function dragendHandler(component, newcoords, currcoords) {
    if (checkNearby(component, newcoords)) {
        component.position({ x: currcoords[0], y: currcoords[1] });
        updateText(component, component.text);
        return;
    }
    unsetOccupied(component)
    currcoords[0] = newcoords[0]
    currcoords[1] = newcoords[1]
    component.position({ x: currcoords[0], y: currcoords[1] });
    handleCompNodes(component)
    setOccupied(component)
    updateText(component, component.text);
}
//========================================Component Nodes Handler Function==========================================
export function handleCompNodes(component) {
    const rotation = component.rotation();
    const width = stage.width();
    const height = stage.height();
    let rownumberofNodes = parseInt((width - GRIDSIZE) / GRIDSIZE)
    if (rotation === 0) {
        let node1Row = (component.y() - GRIDSIZE) / GRIDSIZE
        let node1_index = ((component.x() - component.width() / 2) - GRIDSIZE) / GRIDSIZE + (node1Row * (rownumberofNodes + 1))
        let node2Row = (component.y() - GRIDSIZE) / GRIDSIZE
        let node2_index = ((component.x() + component.width() / 2) - GRIDSIZE) / GRIDSIZE + (node2Row * (rownumberofNodes + 1))
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
        //component.node1 = [component.x() - component.width() / 2, component.y()]
        //component.node2 = [component.x() + component.width() / 2, component.y()]
    }
    else if (rotation == 90) {
        let node1Row = ((component.y() - component.height() / 2) - GRIDSIZE) / GRIDSIZE
        let node1_index = (component.x() - GRIDSIZE) / GRIDSIZE + (node1Row * (rownumberofNodes + 1))
        let node2Row = ((component.y() + component.height() / 2) - GRIDSIZE) / GRIDSIZE
        let node2_index = (component.x() - GRIDSIZE) / GRIDSIZE + (node2Row * (rownumberofNodes + 1))
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
        // component.node1 = [component.x(), component.y() - component.height() / 2]
        // component.node2 = [component.x(), component.y() + component.height() / 2]
    }
    else if (rotation == 180) {
        let node1Row = (component.y() - GRIDSIZE) / GRIDSIZE
        let node1_index = ((component.x() + component.width() / 2) - GRIDSIZE) / GRIDSIZE + (node1Row * (rownumberofNodes + 1))
        let node2Row = (component.y() - GRIDSIZE) / GRIDSIZE
        let node2_index = ((component.x() - component.width() / 2) - GRIDSIZE) / GRIDSIZE + (node2Row * (rownumberofNodes + 1))
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
        //component.node1 = [component.x() + component.width() / 2, component.y()]
        //component.node2 = [component.x() - component.width() / 2, component.y()]
    }
    else if (rotation == 270) {
        let node1Row = ((component.y() + component.height() / 2) - GRIDSIZE) / GRIDSIZE
        let node1_index = (component.x() - GRIDSIZE) / GRIDSIZE + (node1Row * (rownumberofNodes + 1))
        let node2Row = ((component.y() - component.height() / 2) - GRIDSIZE) / GRIDSIZE
        let node2_index = (component.x() - GRIDSIZE) / GRIDSIZE + (node2Row * (rownumberofNodes + 1))
        component.node1 = nodes[node1_index];
        component.node2 = nodes[node2_index];
        // component.node1 = [component.x(), component.y() + component.height() / 2]
        // component.node2 = [component.x(), component.y() - component.height() / 2]
    }
}
//========================================Component Text Update Function==========================================
export function updateText(component) {
    component.text.offsetX(component.text.width() / 2)
    component.text.offsetY(component.text.height() / 2)
    if (component.rotation() === 0) {
        component.text.rotation(0);
        component.text.position({ x: component.x(), y: component.y() - 40 })
    }
    else if (component.rotation() === 90) {
        component.text.rotation(90);
        component.text.position({ x: component.x() + 40, y: component.y() })
    }
    else if (component.rotation() === 180) {
        component.text.rotation(180);
        component.text.position({ x: component.x(), y: component.y() + 40 })
    }
    else if (component.rotation() === 270) {
        component.text.rotation(270);
        component.text.position({ x: component.x() - 40, y: component.y() })
    }
    component.text.text(`${component.name} ${component.getValue()} ${component.prefix === " " ? '' : component.prefix}${component.unit}`);
    component.text.hide();
    if (component.shownText)
        component.text.show();
}
//========================================Remove Component Handler functions==========================================
function removeComponent(component) {
    let currNum = 1;
    components.forEach((currComponent) => {
        if (currComponent !== null && currComponent.type === component.type && currComponent !== component) {
            if (currComponent.name !== `${currComponent.getSymbol()}${currNum++}`) {
                currComponent.name = `${currComponent.getSymbol()}${currNum - 1}`;
                currComponent.text.text(`${currComponent.name} ${component.getValue()} ${component.prefix}${component.unit}`)
            }
        }
    })
    component.decreaseCount();
    components[component.ID] = null;
    component.remove();
}
//========================================Draw Nodes Function==========================================
export function drawNodes() {
    const groundNode = new Konva.Circle({
        x: ground.node.position.x,
        y: ground.node.position.y,
        radius: 4,
        fill: "#772F1A"
    })
    nodeCircles.push(groundNode);
    components.forEach((currComponent) => {
        if (currComponent != null) {
            const node1 = new Konva.Circle({
                x: currComponent.node1.position.x,
                y: currComponent.node1.position.y,
                radius: 4,
                fill: '#772F1A',
            });
            nodeCircles.push(node1);
            const node2 = new Konva.Circle({
                x: currComponent.node2.position.x,
                y: currComponent.node2.position.y,
                radius: 4,
                fill: '#772F1A',
            });
            nodeCircles.push(node2);
        }
        wires.forEach((wire) => {
            if (wire != null) {
                wire.gridPoints.forEach((point) => {
                    let newNode = true;
                    nodeCircles.forEach((node) => {
                        if (node.x() == point.position.x && node.y() == point.position.y) newNode = false;
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
            }
        })
    })
    nodeCircles.forEach((node) => {
        node.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
        })
        node.on('mouseout', () => {
            document.body.style.cursor = 'default';
        })
        node.on('click', () => {
            node.fill('green')
        })
        layer.add(node)
    })
    layer.batchDraw();
}
//========================================Remove Nodes Function==========================================
export function removeNodes() {
    nodeCircles.forEach((node) => {
        node.remove();
    })
    nodeCircles = [];
    layer.batchDraw();
}
//========================================Check Connection Nodes Function==========================================
// export function checkConnectionNodes(clickedNodes) {
//     let sameComp = false;
//     components.forEach((component) => {
//         if (component != null) {
//             for (let i = 0; i < 2; i++) {
//                 if (component.node1[0] === clickedNodes[i].x() && component.node1[1] === clickedNodes[i].y()
//                     && component.node2[0] === clickedNodes[1 - i].x() && component.node2[1] === clickedNodes[1 - i].y()) {
//                     sameComp = true;
//                 }
//             }
//         }
//     })
//     return sameComp;
// }
//========================================A* algorithm==========================================
export function heuristic(startNode, endNode) {
    return Math.abs(startNode.x - endNode.x) + Math.abs(startNode.y - endNode.y);
}

export function reconstructPath(node) {
    let path = [];
    while (node) {
        path.push(node);
        node = node.parent;
    }
    return path.reverse(); // Reverse the path to start-to-goal order
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
            } else if (tentativeG >= neighbor.g) { // tentativeg is one step + the currentg, by default tentativeG is Infinity, if it was set during exploring some path, it will have a comparable value
                return; // If this path is not better, skip it
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
//========================================Flash Message Function==========================================
export function flashMsg(msg) {
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none'
    }, 2000)
}
//========================================Draw Wire Function==========================================
export function drawWire(stage, clickedNodes) {
    const width = stage.width();
    const height = stage.height();
    let rownumberofNodes = parseInt((width - GRIDSIZE) / GRIDSIZE)
    let node1Row = (clickedNodes[0].y() - GRIDSIZE) / GRIDSIZE
    let node1_index = (clickedNodes[0].x() - GRIDSIZE) / GRIDSIZE + (node1Row * (rownumberofNodes + 1))
    let node2Row = (clickedNodes[1].y() - GRIDSIZE) / GRIDSIZE
    let node2_index = (clickedNodes[1].x() - GRIDSIZE) / GRIDSIZE + (node2Row * (rownumberofNodes + 1))
    nodeCircles.forEach((node) => {
        let nodeRow = (node.y() - GRIDSIZE) / GRIDSIZE
        let nodeIdx = (node.x() - GRIDSIZE) / GRIDSIZE + (nodeRow * (rownumberofNodes + 1))
        if (nodeIdx != node1_index && nodeIdx != node2_index) nodes[nodeIdx].occupied = true;
    })
    let wireNodes = aStar(nodes[node1_index], nodes[node2_index]);
    if (!wireNodes) return false;
    let wire = new Wire();
    wire.gridPoints = wireNodes;
    for (let i = 0; i < wireNodes.length - 1; i++) {
        const line = new Konva.Line({
            points: [wireNodes[i].position.x, wireNodes[i].position.y, wireNodes[i + 1].position.x, wireNodes[i + 1].position.y],
            stroke: 'black',
            strokeWidth: 2,
            listening: true,
        });
        layer.add(line);
        wire.drawnLines.push(line);
    }
    wires.push(wire);
    nodeCircles.forEach((node) => {
        let nodeRow = (node.y() - GRIDSIZE) / GRIDSIZE
        let nodeIdx = (node.x() - GRIDSIZE) / GRIDSIZE + (nodeRow * (rownumberofNodes + 1))
        nodes[nodeIdx].occupied = false;
    })
    removeNodes();
    wire.drawnLines.forEach((line) => {
        line.on('dblclick', () => {
            console.log(wires);
            if (addingWire) return;
            wire.drawnLines.forEach((line) => {
                line.remove();
            })
            wires[wire.ID] = null;
            console.log(wires);
        })
    })
}
//========================================Dragging Toggling Function==========================================
export function disableDragging() {
    components.forEach((comp) => {
        if (comp === null) return;
        comp.draggable(false)
    })
    ground.draggable(false);
}
export function enableDragging() {
    components.forEach((comp) => {
        if (comp === null) return;
        comp.draggable(true)
    })
    ground.draggable(true);
}
//========================================Generate Net list Function==========================================
function haveCommonNodes(node1, node2) {
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

function updateNodes() {
    uniqueNodes = {}
    tempNodes = {}
    nodeCounter = 1;
    let tempCounter = 1;
    wires.forEach((wire) => {
        if (wire == null) return;
        for (let i = 1; i < nodeCounter; i++) {
            for (let j = 0; j < wire.gridPoints.length; j++) {
                if (uniqueNodes[`N${i}`][`${wire.gridPoints[j].index}`]) {
                    for (let k = 0; k < wire.gridPoints.length; k++) {
                        uniqueNodes[`N${i}`][`${wire.gridPoints[k].index}`] = true;
                    }
                    return;
                }
            }
        }
        if (!uniqueNodes[`N${nodeCounter}`]) uniqueNodes[`N${nodeCounter}`] = {};
        for (let i = 0; i < wire.gridPoints.length; i++) {
            uniqueNodes[`N${nodeCounter}`][`${wire.gridPoints[i].index}`] = true;
        }
        nodeCounter++;
    })
    for (let i = 1; i < nodeCounter; i++) {
        let foundCommon = false;
        for (let j = i + 1; j < nodeCounter; j++) {
            if (haveCommonNodes(uniqueNodes[`N${i}`], uniqueNodes[`N${j}`])) {
                foundCommon = true;
                uniqueNodes[`N${i}`] = { ...uniqueNodes[`N${i}`], ...uniqueNodes[`N${j}`] }
                uniqueNodes[`N${j}`] = {};
            }
        }
        if (foundCommon) {
            tempNodes[`N${tempCounter++}`] = uniqueNodes[`N${i}`];
        }
        if (!foundCommon && Object.keys(uniqueNodes[`N${i}`]).length !== 0) {
            tempNodes[`N${tempCounter++}`] = uniqueNodes[`N${i}`];
        }
    }
    nodeCounter = tempCounter;
    uniqueNodes = tempNodes;
    components.forEach((component) => {
        if (component == null) return
        let node1Defined = false;
        let node2Defined = false;
        for (let i = 1; i < nodeCounter; i++) {
            if (uniqueNodes[`N${i}`][`${component.node1.index}`]) {
                node1Defined = true;
            }
            if (uniqueNodes[`N${i}`][`${component.node2.index}`]) {
                node2Defined = true;
            }
        }
        if (!node1Defined) {
            uniqueNodes[`N${nodeCounter}`] = {};
            uniqueNodes[`N${nodeCounter}`][`${component.node1.index}`] = true;
            nodeCounter++;
        }
        if (!node2Defined) {
            uniqueNodes[`N${nodeCounter}`] = {};
            uniqueNodes[`N${nodeCounter}`][`${component.node2.index}`] = true;
            nodeCounter++;
        }
    })
    for (let i = 1; i < nodeCounter; i++) {
        if (uniqueNodes[`N${i}`][`${ground.node.index}`]) {
            uniqueNodes['GND'] = uniqueNodes[`N${i}`];
            let j = i
            for (; j < nodeCounter - 1; j++) {
                uniqueNodes[`N${j}`] = uniqueNodes[`N${j + 1}`]
            }
            delete uniqueNodes[`N${j}`];
            nodeCounter--;
            break;
        }
    }
    if (!uniqueNodes['GND']) {
        uniqueNodes['GND'] = {};
        uniqueNodes['GND'][`${ground.node.index}`] = true;
    }
}
export function genNetList() {
    updateNodes();
    let netList = [];
    components.forEach((component) => {
        if (component === null) return;
        // let out = '';
        // out += component.getSymbol();
        let node1, node2;
        for (const key of Object.keys(uniqueNodes)) {
            if (uniqueNodes[key][`${component.node1.index}`]) node1 = key;
        }
        for (const key of Object.keys(uniqueNodes)) {
            if (uniqueNodes[key][`${component.node2.index}`]) node2 = key;
        }
        // out += component.value;
        // out += component.prefix === ' ' ? '' : component.prefix;
        // out += component.unit
        // console.log(out)
        let listObj = { type: component.getSymbol(), Node1: node1, Node2: node2, Value: component.value, exponent: getExponent(component.prefix) }
        netList.push(listObj)
    })
    console.log(netList)
    const numberOfNodes = Object.keys(uniqueNodes).length - 1;
    let voltageSourceCount = 0;
    let voltageSourceIndeces = [];
    for (let i = 0; i < netList.length; i++) {
        if (netList[i].type === 'Vs') {
            voltageSourceCount++;
            voltageSourceIndeces.push(i);
        };
    }
    const matrixSize = numberOfNodes + voltageSourceCount;
    let gMatrix = new Array(matrixSize)
    let iMatrix = new Array(matrixSize);
    iMatrix.fill(0)
    for (let i = 0; i < matrixSize; i++) {
        gMatrix[i] = new Array(matrixSize);
        gMatrix[i].fill(0);
    }
    for (let i = 0; i < netList.length; i++) {
        if (netList[i].type === 'R') {
            let node1 = parseInt(netList[i].Node1.slice(1))
            let node2 = parseInt(netList[i].Node2.slice(1))
            if (!Number.isNaN(node1)) {
                gMatrix[node1 - 1][node1 - 1] += 1 / (parseInt(netList[i].Value) * netList[i].exponent);
            }
            if (!Number.isNaN(node2)) {
                gMatrix[node2 - 1][node2 - 1] += 1 / (parseInt(netList[i].Value) * netList[i].exponent);
            }
            if (!Number.isNaN(node1) && !Number.isNaN(node2)) {
                gMatrix[node1 - 1][node2 - 1] -= 1 / (parseInt(netList[i].Value) * netList[i].exponent);
                gMatrix[node2 - 1][node1 - 1] -= 1 / (parseInt(netList[i].Value) * netList[i].exponent);
            }
        }
        else if (netList[i].type === 'Cs') {
            let node1 = parseInt(netList[i].Node1.slice(1))
            let node2 = parseInt(netList[i].Node2.slice(1))
            if (!Number.isNaN(node1)) {
                iMatrix[node1 - 1] += parseInt(netList[i].Value * netList[i].exponent);
            }
            if (!Number.isNaN(node2)) {
                iMatrix[node2 - 1] -= parseInt(netList[i].Value * netList[i].exponent);
            }
        }
    }
    for (let i = 0; i < voltageSourceIndeces.length; i++) {
        const currentVSource = netList[voltageSourceIndeces[i]];
        let node1 = parseInt(currentVSource.Node1.slice(1));
        let node2 = parseInt(currentVSource.Node2.slice(1));
        if (!Number.isNaN(node1)) {
            console.log(node1 - 1)
            console.log(numberOfNodes + i)
            console.log(gMatrix)
            gMatrix[node1 - 1][numberOfNodes + i] += 1;
            gMatrix[numberOfNodes + i][node1 - 1] += 1;
        }
        if (!Number.isNaN(node2)) {
            gMatrix[node2 - 1][numberOfNodes + i] -= 1;
            gMatrix[numberOfNodes + i][node2 - 1] -= 1;
        }
        iMatrix[numberOfNodes + i] += parseInt(currentVSource.Value * currentVSource.exponent);
    }
    for (let i = 0; i < numberOfNodes; i++) {
        console.log(gMatrix[i])
    }
    console.log(iMatrix)
    let nodeVoltages = math.lusolve(gMatrix, iMatrix);
    console.log(nodeVoltages)
    let nodesText = [];
    let nodeColors = []
    for (let i = 0; i < nodeVoltages.length - voltageSourceCount; i++) {
        console.log(i)
        let nodeIdx = parseInt(Object.keys(uniqueNodes[`N${i + 1}`])[0]);
        let curr = nodes[nodeIdx]
        const node = new Konva.Circle({
            x: curr.position.x,
            y: curr.position.y,
            radius: 4,
            fill: radnomColor()
        })
        layer.add(node);
        nodeColors.push(node);
    }
    for (let i = 0; i < nodeColors.length; i++) {
        const text = new Konva.Text({
            x: 700, // Center the text above the resistance
            y: 200 + 50 * i, // Position it above the resistance
            text: `${formatOutput(nodeVoltages[i])}V`,
            fontSize: 20,
            fontFamily: 'Calibri',
            fill: nodeColors[i].fill(),
            align: 'center',
            weight: 'bold',
            listening: false // Make it non-interactive
        });
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);
        // text.x(curr.position.x);
        // text.y(text.y() + 30)
        layer.add(text);
    }
    layer.batchDraw()

}
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
            throw new Error(`Unknown prefix: ${prefix}`);
    }
}
function radnomColor() {
    // Generate random RGB values in the lower range (0-128) for a dark color
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    // Convert to hexadecimal and return as a color code
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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
//========================================Helper Functions End==========================================