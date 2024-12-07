# Electric Circuit Simulator

**Wiroworks** is a powerful and interactive web-based tool for designing, analyzing, and simulating electrical circuits. The project allows users to create circuit layouts with various components, connect them through wires, and analyze them using Modified Nodal Analysis (MNA). The tool also generates a detailed netlist for the designed circuit.

## Features
- **Interactive GUI**:
  - Drag-and-drop components onto a grid-based workspace.
  - Snap components and wires to the grid for precise alignment.
  - Visual feedback for connected and overlapping components.
- **Comprehensive Components Library**:
  - Supports resistors, DC voltage sources, current sources, wires, and ground nodes.
  - Dynamic naming and easy modification of component properties.
- **Real-time Analysis**:
  - Automatically generates a netlist based on user design.
  - Solves circuit equations using MNA to compute node voltages and branch currents.
- **Customizable Output**:
  - Color-coded nodes for better visualization.
  - Detailed tabular output with node voltages and branch currents.
- **Advanced Algorithms**:
  - A* pathfinding for optimized wire drawing.
  - Automatic node merging for unique circuit nodes.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Ali-Said1/wiroworks.git
   ```
2. Navigate to the project directory:
   ```bash
   cd electric-circuit-simulator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the application using Parcel:
   ```bash
   npx parcel index.html
   ```

## Usage
1. Launch the simulator in your browser.
2. Use the grid interface to place components like resistors, voltage sources, and wires.
3. Connect components and snap them to grid points.
4. Generate and view the netlist by clicking the "run" button.
5. Analyze node voltages and branch currents through the output table.

## Components Overview
### Component Class
- **Purpose**: Base class for all components, handles positioning, orientation, and properties.
- **Key Attributes**:
  - `name`: Unique identifier for the component.
  - `type`: Component type (e.g., resistor, voltage source).
  - `value`: Component value (e.g., resistance in ohms).
  - `unit`: Unit of the component value (e.g., ohms, volts).
- **Key Methods**:
  - `setValue(val)`: Updates the component value.
  - `getValue()`: Retrieves the current component value.
  - `setPrefix(val)`: Updates the metric prefix for the value.

### Specialized Classes
- **Ground Class**:
  - Represents the circuit ground with a single node.
  - Includes a unique symbol `GND`.
- **Resistance Class**:
  - Includes a symbol `R` for resistors.
- **dcBattery Class**:
  - Represents a DC voltage source with a symbol `Vs`.
- **dcCurrentSource Class**:
  - Represents a DC current source with a symbol `Cs`.
- **Wire Class**:
  - Represents wire connections as a collection of connected grid points.

## Key Functionalities
### Grid System
- `drawGrid()`: Renders the grid layout for placing components.
- `snapToGrid(value)`: Aligns components to the nearest grid point.

### Circuit Design
- `addGround()`: Adds a ground node to the circuit.
- `addCompSVG(image, svg)`: Dynamically generates SVG graphics for components.
- `checkNearby(component, newcoords)`: Validates the placement of components to avoid overlap.
- `setOccupied(component)`: Marks nodes as occupied to prevent wires going through components.

### Wire Routing
- `aStar(startNode, endNode)`: Implements the A* algorithm for efficient wire routing.
- `drawWire(clickedNodes)`: Draws wires between selected nodes, ensuring connectivity.

### Netlist Generation
- `updateNodes()`: Defines unique nodes in the circuit and merges overlapping ones.
- `genNetList()`: Generates the netlist and solves the circuit equations using MNA.

### Output
- `drawTable(outputValues, voltageSources, nodeColors)`: Displays a formatted table of node voltages and branch currents.
- `randomColor(nodeColors)`: Assigns distinct colors to each node for clarity.

## Project Structure
- **`index.html`**: The main HTML entry point.
- **`index.js`**: Core logic for managing components, wires, and user interactions.
- **`styles.css`**: Styling for the simulator interface.
- **`classes.js`**: Contains scripts for individual component classes (e.g., resistor, voltage source).
- **`helpers.js`**: Utility functions for operations like snapping to grid and pathfinding.

## Demo
![Demo](assets/demo.gif)
## Access Online
The simulator is available online at <b>Github Pages</b>: [Wiroworks](https://ali-said1.github.io/wiroworks)


## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push to your fork.
4. Submit a pull request with a description of your changes.

## License
This project is licensed under the [MIT License](LICENSE).