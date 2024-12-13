import Konva from "konva";

let currentId = -1; // Starts from -1 so the ground doesn't count
let wireID = 0;

//==============================================Base Component Class=============================================
class Component extends Konva.Image {
    constructor(element) {
        super(element);
        this.name = '';
        this.node1 = null;
        this.node2 = null;
        this.horizontal = true;
        this.type = ''
        this.value = 1;
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
        if (Number.isFinite(parseFloat(val)) && val >= 0) {
            this.value = parseFloat(val);
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
        if (Number.isFinite(parseInt(val)) && ((parseInt(val) == 0) || (parseInt(val) == 90) || (parseInt(val) == 180) || (parseInt(val) == 270))) {
            this.rotation(parseInt(val));
        }
    }
    getValue() {
        return this.value;
    }
}
//==============================================Ground Component Class=============================================
export class Ground extends Component {
    constructor(element) {
        super(element);
        this.type = 'Ground'
        this.node = null;
        this.name = `GND`
    }
    getSymbol() {
        return 'GND';
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
//===============================================Dependednt DC Voltage Source Component Class=============================================
export const ControlSource = {
    CURRENT: 'current',
    VOLTAGE: 'voltage'
};

export class ddcBattery extends Component {
    static count = 1;
    constructor(element) {
        super(element)
        this.dependent = true;
        this.type = 'Dependednt DC Voltage Source';
        this.controlsource = ControlSource.VOLTAGE;
        this.gain = 1;
        this.dependency = null;
        this.unit = 'V'
        this.name = `DVs${ddcBattery.count++}`
    }
    getSymbol() {
        return 'DVs'
    }
    decreaseCount() {
        ddcBattery.count--;
    }
    setGain(val) {
        if (Number.isFinite(parseFloat(val))) {
            this.gain = parseFloat(val);
        }
    }
    setControlSource(val) { // Disabled currently, only sets to voltage controlled voltage source
        if (val === ControlSource.CURRENT) {
            this.controlsource = ControlSource.VOLTAGE;
            alert("No support for CCVS currently");
        }
        else if (val === ControlSource.VOLTAGE) this.controlsource = ControlSource.VOLTAGE;
        else this.controlsource = ControlSource.VOLTAGE;
    }
}
//===============================================Dependednt DC Current Source Component Class=============================================
export class ddcCurrentSource extends Component {
    static count = 1;
    constructor(element) {
        super(element)
        this.dependent = true;
        this.type = 'Dependednt DC Current Source';
        this.controlsource = ControlSource.VOLTAGE;
        this.gain = 1;
        this.dependency = null;
        this.unit = 'V'
        this.name = `DCs${ddcCurrentSource.count++}`
    }
    getSymbol() {
        return 'DCs'
    }
    decreaseCount() {
        ddcCurrentSource.count--;
    }
    setGain(val) {
        if (Number.isFinite(parseFloat(val))) {
            this.gain = parseFloat(val);
        }
    }
    setControlSource(val) { // Disabled currently, only sets to voltage controlled voltage source
        if (val === ControlSource.CURRENT) {
            this.controlsource = ControlSource.VOLTAGE;
            alert("No support for CCVS currently");
        }
        else if (val === ControlSource.VOLTAGE) this.controlsource = ControlSource.VOLTAGE;
        else this.controlsource = ControlSource.VOLTAGE;
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
//===============================================Wire Component Class=============================================
export class Wire {
    constructor() {
        this.ID = wireID++;
        this.type = 'Wire';
        this.gridPoints = [];
        this.drawnLines = [];
    }
}
//===============================================Switch Component Class=============================================
// export class Switch extends Component {
//     static count = 1;
//     constructor(element) {
//         super(element)
//         this.state = 'on';
//         this.type = 'Switch';
//     }


//     toggle() {
//         this.state = (this.state === 'off') ? 'on' : 'off';
//     }

//     getState() {
//         return this.state;
//     }
// }