import Konva from 'konva'

export let layer = new Konva.Layer();
export const GRIDSIZE = 30;
export let components = []; // component != null
export let nodeCircles = [];
export let wires = [];

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

//========================================Show Component details Function==========================================
export function showDetails(component, unit) {
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
//========================================Component Initializer Function==========================================
export function initializeComponent(component, image) {
    component.x(75);
    component.y(60);
    component.image(image);
    component.width(GRIDSIZE * 3);
    component.draggable(true);
    component.rotation(0);
    component.offsetX(component.width() / 2)
    component.offsetY(component.height() / 2)
}
//========================================Component Text Initialzier Function==========================================
export function initializeComptext(component) {
    const text = new Konva.Text({
        x: component.x(), // Center the text above the resistance
        y: component.y() - 40, // Position it above the resistance
        text: `${component.name} ${component.getValue()} ${component.prefix}${component.unit}`,
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
                    }
                }
                updateText(component, text)
                handleCompNodes(component)
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
    currcoords[0] = newcoords[0]
    currcoords[1] = newcoords[1]
    component.position({ x: currcoords[0], y: currcoords[1] });
    handleCompNodes(component)
    updateText(component, component.text);
}
//========================================Component Nodes Handler Function==========================================
export function handleCompNodes(component) {
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
        component.node2 = [component.x() - component.width() / 2, component.y()]
    }
    else if (rotation == 270) {
        component.node1 = [component.x(), component.y() + component.height() / 2]
        component.node2 = [component.x(), component.y() - component.height() / 2]
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
    component.text.text(`${component.name} ${component.getValue()} ${component.prefix}${component.unit}`);
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
    components.forEach((currComponent) => {
        if (currComponent != null) {
            if (!currComponent.node1Connected) {
                const node = new Konva.Circle({
                    x: currComponent.node1[0],
                    y: currComponent.node1[1],
                    radius: 4,
                    fill: '#772F1A',
                });
                nodeCircles.push(node);
            }
            if (!currComponent.node2Connected) {
                const node = new Konva.Circle({
                    x: currComponent.node2[0],
                    y: currComponent.node2[1],
                    radius: 4,
                    fill: '#772F1A',
                });
                nodeCircles.push(node);
            }
        }
    })
    nodeCircles.forEach((node) => {
        node.on('mouseover', () => {
            document.body.style.cursor = 'pointer';
        })
        node.on('mouseout', () => {
            document.body.style.cursor = 'default';
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
export function checkConnectionNodes(clickedNodes) {
    components.forEach((component) => {
        if (component != null) {
            for (let i = 0; i < 2; i++) {
                if (component.node1[0] === clickedNodes[i].x() && component.node1[1] === clickedNodes[i].y()
                    && component.node2[0] === clickedNodes[1 - i].x() && component.node2[1] === clickedNodes[1 - i].y()) {
                    return false;
                }
            }
        }
    })
    return true;
}
//========================================Helper Functions End==========================================