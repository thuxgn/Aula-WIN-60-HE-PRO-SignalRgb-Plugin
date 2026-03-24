export function Name() { return "Aula WIN 60 HE PRO"; }
export function VendorId() { return 0x1ca2; }
export function ProductId() { return 0x1902; }
export function Publisher() { return "thuxgn"; }
export function Documentation(){ return ""; }
export function Size() { return [14, 5]; }
export function DefaultPosition(){return [24, 55];}
export function DefaultScale(){return 1.0;}

/*global
shutdownColor:readonly
LightingMode:readonly
forcedColor:readonly
*/

export function ControllableParameters(){
  return [
    {"property":"shutdownColor", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"009bde"},
    {"property":"LightingMode", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
    {"property":"forcedColor", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"009bde"},
  ];
}


export function vKeys() {
    return [
        /* 
        [x,         y,        hid_code,     name]
        */

        // r1
        [0,         0,          0x29,      "Esc"],
        [1,         0,          0x1E,      "1"],
        [2,         0,          0x1F,      "2"],
        [3,         0,          0x20,      "3"],
        [4,         0,          0x21,      "4"],
        [5,         0,          0x22,      "5"],
        [6,         0,          0x23,      "6"],
        [7,         0,          0x24,      "7"],
        [8,         0,          0x25,      "8"],
        [9,         0,          0x26,      "9"],
        [10,        0,          0x27,      "0"],
        [11,        0,          0x2D,      "-"],
        [12,        0,          0x2E,      "="],
        [13,        0,          0x2A,      "Backspace"],

        // r2
        [0,         1,          0x2B,      "Tab"],
        [1.5,       1,          0x14,      "Q"],
        [2.5,       1,          0x1A,      "W"],
        [3.5,       1,          0x08,      "E"],
        [4.5,       1,          0x15,      "R"],
        [5.5,       1,          0x17,      "T"],
        [6.5,       1,          0x1C,      "Y"],
        [7.5,       1,          0x18,      "U"],
        [8.5,       1,          0x0C,      "I"],
        [9.5,       1,          0x12,      "O"],
        [10.5,      1,          0x13,      "P"],
        [11.5,      1,          0x2F,      "["],
        [12.5,      1,          0x30,      "]"],
        [13.5,      1,          0x31,      "\\"],

        // r3
        [0,         2,          0x39,      "Caps Lock"],
        [1.75,      2,          0x04,      "A"],
        [2.75,      2,          0x16,      "S"],
        [3.75,      2,          0x07,      "D"],
        [4.75,      2,          0x09,      "F"],
        [5.75,      2,          0x0A,      "G"],
        [6.75,      2,          0x0B,      "H"],
        [7.75,      2,          0x0D,      "J"],
        [8.75,      2,          0x0E,      "K"],
        [9.75,      2,          0x0F,      "L"],
        [10.75,     2,          0x33,      ";"],
        [11.75,     2,          0x34,      "'"],
        [12.75,     2,          0x28,      "Enter"],

        // r4
        [0,         3,          0xE1,      "Left Shift"],
        [2.25,      3,          0x1D,      "Z"],
        [3.25,      3,          0x1B,      "X"],
        [4.25,      3,          0x06,      "C"],
        [5.25,      3,          0x19,      "V"],
        [6.25,      3,          0x05,      "B"],
        [7.25,      3,          0x11,      "N"],
        [8.25,      3,          0x10,      "M"],
        [9.25,      3,          0x36,      ","],
        [10.25,     3,          0x37,      "."],
        [11.25,     3,          0x38,      "/"],
        [12.25,     3,          0xE5,      "Right Shift"],

        // r5
        [0,         4,          0xE0,      "Left Ctrl"],
        [1.25,      4,          0xE3,      "Left Windows"],
        [2.5,       4,          0xE2,      "Left Alt"],
        [3.75,      4,          0x2C,      "Space"],
        [10.0,      4,          0xE6,      "Right Alt"],
        [11.25,     4,          0x65,      "Menu"],
        [12.5,      4,          0xE4,      "Right Ctrl"],
        [13.75,     4,          0x01,      "Fn"]
    ];
}

export function Initialize() {
    device.addFeature("keyboard");
}

export function Render() {
  sendColors();
}

export function Shutdown(SystemSuspending) {
    if(SystemSuspending){
        sendColors("#FF0000"); 
    }else{
        sendColors("#000000");
    }
}

function sendColors(overrideColor) {
    let keys = vKeys();

    let packet = new Array(65).fill(0x00);
    
    packet[1] = 0x5C;
    packet[2] = 0x05;
    packet[3] = 0x2A;
     
    let keyCount = 0;
    let packetIndex = 6; 
    
    for (let i = 0; i < keys.length; i++) {

        const [iPxX, iPxY, hidCode] = keys[i];
        
        let color;

        if (overrideColor) {
            color = hexToRgb(overrideColor);
        } else if (LightingMode === "Forced") {
            color = hexToRgb(forcedColor);
        } else {
            color = device.color(iPxX, iPxY); 
        }

        packet[4] = 0xC0 + color[2];
        
        packet[packetIndex++] = hidCode;
        packet[packetIndex++] = color[0];
        packet[packetIndex++] = color[1];
        packet[packetIndex++] = color[2];
        
        keyCount++;
        
        if (keyCount == 14 || i == keys.length - 1) {

            packet[5] = keyCount;
            
            device.write(packet, 65);    
            
            packet = new Array(65).fill(0x00);
            packet[0] = 0x00;
            packet[1] = 0x5C;
            packet[2] = 0x05;
            packet[3] = 0x2A;
            keyCount = 0;
            packetIndex = 6;
        }
    }
}

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  let colors = [];
  colors[0] = parseInt(result[1], 16);
  colors[1] = parseInt(result[2], 16);
  colors[2] = parseInt(result[3], 16);

  return colors;
}

export function Validate(endpoint) {
  return endpoint.interface === 2 && endpoint.usage === 0x0001 && endpoint.usage_page === 0xffa0 && endpoint.collection === 0x0000;
}

export function ImageUrl() {
  return "https://aulahub.aulacn.com/hub/assets/win60hePro-BCQHuCGe.png";
}