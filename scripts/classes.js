import Konva from "konva";

let currentId = -1;
let wireID = 0;

//==============================================Base Component Class=============================================
class Component extends Konva.Image {
    constructor(element) {
        super(element);
        this.name = '';
        this.node1 = [this.x(), this.y() + this.height() / 2];
        this.node2 = [this.x() + this.width(), this.y() + this.height() / 2];
        this.horizontal = true;
        this.type = ''
        this.value = 1;
        this.polarity = 'NULL'
        this.node1Connected = false;
        this.node2Connected = false;
        this.ID = currentId++;
        this.prefix = ' '
        this.shownText = true
        this.unit = '';
        this.text = null;
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
//==============================================Ground Component Class=============================================
export class Ground extends Component {
    static count = 1;
    constructor(element) {
        super(element);
        this.type = 'Ground'
        this.node = null;
        this.name = `GND`
    }
    getSymbol() {
        return 'GND';
    }
    decreaseCount() {
        Ground.count--;
    }
}
//==============================================Resistance Component Class=============================================
export class Resistance extends Component {
    static count = 1;
    constructor(element) {
        super(element)
        this.type = 'Resistance'
        this.unit = '\u03A9'
        this.name = `R${Resistance.count++}`
    }
    getSymbol() {
        return 'R'
    }
    decreaseCount() {
        Resistance.count--;
    }
}
//===============================================DC Voltage Source Component Class=============================================
export class dcBattery extends Component {
    static count = 1;
    constructor(element) {
        super(element)
        this.type = 'DC Voltage Source';
        this.unit = 'V'
        this.name = `Vs${dcBattery.count++}`
    }
    getSymbol() {
        return 'Vs'
    }
    decreaseCount() {
        dcBattery.count--;
    }
}
//===============================================DC Current Source Component Class=============================================
export class dcCurrentSource extends Component {
    static count = 1;
    constructor(element) {
        super(element)
        this.type = 'DC Current Source';
        this.unit = 'A'
        this.name = `Cs${dcCurrentSource.count++}`
    }
    getSymbol() {
        return 'Cs'
    }
    decreaseCount() {
        dcCurrentSource.count--;
    }
}
//===============================================Switch Component Class=============================================
export class Switch extends Component {
    static count = 1;
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
//===============================================Wire Component Class=============================================
export class Wire {
    constructor() {
        this.ID = wireID++;
        this.type = 'Wire';
        this.gridPoints = [];
        this.drawnLines = [];
        this.connectedComponents = [];
    }
}
