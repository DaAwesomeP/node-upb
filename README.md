node-upb [![Gitter chat](https://img.shields.io/gitter/room/DaAwesomeP/node-upb.js.svg?maxAge=2592000&style=flat-square)](https://gitter.im/DaAwesomeP/node-upb)
========
[![npm](http://img.shields.io/npm/v/upb.svg?style=flat-square)](https://www.npmjs.org/package/upb) [![npm](http://img.shields.io/npm/dm/upb.svg?style=flat-square)](https://www.npmjs.org/package/upb) [![bower](http://img.shields.io/bower/v/upb.svg?style=flat-square)](https://github.com/DaAwesomeP/node-upb) [![david](https://img.shields.io/david/DaAwesomeP/node-upb.svg?style=flat-square)](https://david-dm.org/DaAwesomeP/node-upb) [![Travis](https://img.shields.io/travis/DaAwesomeP/node-upb.svg?maxAge=2592000&style=flat-square)](https://travis-ci.org/DaAwesomeP/node-upb) [![Coveralls](https://img.shields.io/coveralls/DaAwesomeP/node-upb.svg?maxAge=2592000&style=flat-square)](https://coveralls.io/github/DaAwesomeP/node-upb) [![license](http://img.shields.io/npm/l/upb.svg?style=flat-square)](https://github.com/DaAwesomeP/node-upb/blob/master/LICENSE)
---
A NodeJS, Bower, browser, AMD, and CommonJS (that includes RequireJS) library that generates and decodes UPB (Universal Powerline Bus) commands. **If you are looking for the CLI program that uses this, then please see [upb-cli](https://github.com/DaAwesomeP/upb-cli/).**

**This has only been tested with Simply Automated switches!** While probably won't harm your device (it is sending control commands, not core commands), I'm not sure what will happen when this is used with other branded switches (like PCS).

## Installation

### Node
Install it to your project folder:
```bash
npm install upb
```
Then include it in your file:
```javascript
var upb = require("upb");
```

### Browser
Either download the package via [Bower](http://bower.io/) (package named `upb`) or download the [latest release](https://github.com/DaAwesomeP/node-upb/releases/latest) and include it in your page:
```html
<script type="text/javascript" src="upb.js"></script>
```
Use it with the `upb` object. The examples below should work fine. There is a minified version in the `/dist/` folder or available for download from the releases page.

## Usage

### generate(command)
The function takes a JSON object input as `command` and returns a promise withg a new JSON object with more data (including the generated command) as the first argument of the callback function.

**If you plan on making your own serial implementation using this, remember to put the PIM in message mode first and to proceed each UPB command with the ASCII #20 character and to end it with the ASCII #13 character.** Also, the PIM will automatically send the correct number of commands based on `sendx`. So, `sendTime` is only useful for displaying commands and not sending them.

**Example:**
```javascript
upb.generate({
  network: 21, 				// Required - Set Network ID. Use 0 for the global network (controls all devices)
  id: 4,					// Required - Set link or device ID
  type: "device",			// Required - Set whether to control a link or device
  source: 255,				// Optional - Set PIM source ID. Defaults to 255, which is almost always fine.
  cmd: "goto",				// Required - Set the command to send. You may also use the command numbers associated with those commands.
  level: 75,				// Optional - Set the level (percent). Accepts values 0 through 100. Required with goto and fade start. Only applies to goto, fadeStart, fadeStop, and toggle. Otherwise this will be ignored.
  rate: 5,					// Optional - Set the fade rate (seconds). Use false for instant on. Only applies to goto, fadeStart, and toggle. Otherwise  this will be ignored. Defaults to device settings.
  channel: false, 			// Optional - Set the channel to use. Use false for default. Only applies to goto, fadeStart, blink, and toggle. Otherwise this will be ignored. Only works on some devices. Defaults to off (command not sent).
  sendx: 2,					// Optional - Set the number of times to send the command. Accepts numbers 1 through 4. Defaults to 1.
  sendTime: 1,				// Optional - Send the number of time this command is sent out of the total (sendx). NOTE: THE PIM WILL AUTOMATICALLY SEND THE CORRECT NUMBER OF COMMANDS! So, this is only useful for displaying commands and not sending them. Accepts numbers 1 through 4. Cannot be greater than sendx. Defaults to 1.
  ackPulse: false,			// Optional - Request an acknowledge pulse. Defaults to false.
  idPulse: false, 			// Optional - Request an ID pulse. Defaults to false.
  ackMsg: true,  			// Optional - Request an acknowledge message. Defaults to false.
  powerlineRepeater: false,	// Optional - Request for the command to go through a powerline repeater. Set or numbers 1, 2, 4, or false. Defaults to false.
  blinkRate: 255,			// Optional - Set the blink rate (unknown unit). USE CAUTION WITH LOW NUMBERS! I am not sure what unit this is in. Accepts values 1 through 255. Required for blink. Only applies to blink. Otherwise this will be ignored.
  toggleCount: 0,			// Optional - Set the toggle count. Required for toggle. Only applies to toggle. Otherwise this will be ignored.
  toggleRate: 5				// Optional - Set the toggle rate. Only applies to toggle. Otherwise this will be ignored. Defaults to 0.5.
}).then(function(commandNew) {
  console.log(commandNew.generated);			// 09441504FF224B0529
  console.log(JSON.stringify(commandNew));
  // {"source":255,"sendx":"2","ackPulse":false,"idPulse":false,"ackMsg":true,"powerlineRepeater":false,"sendTime":1,"network":"21","id":"4","type":"device","cmd":"goto","level":"75","rate":"5","ctrlWord":{"byte1":0,"byte2":9,"byte3":4,"byte4":4},"words":9,"hex":{"network":"15","id":"4","source":"ff","msg":"22","level":"4b","rate":"5","ctrlWord":{"byte1":"0","byte2":"9","byte3":"4","byte4":"4","fullByte1":"09","fullByte2":"44"}},"msg":22,"generated":"09441504FF224B0529","checksum":"29"}
}, function(err) {
  throw err;
});
```

### decode(command, callback)
The function takes a string input as `command` and returns a JSON object with data (including the original command) as the first argument of the callback function. The second argument of the callback function is for errors. **This does not verify the checksum.** However, it will throw errors for other problems in the command.

**Example:**
```javascript
upb.decode('09441504FF224B0529').then(function(commandNew) {
  console.log(JSON.stringify(commandNew));
  // {"source":255,"sendx":2,"sendTime":1,"ackPulse":false,"idPulse":false,"ackMsg":true,"powerlineRepeater":0,"hex":{"ctrlWord":{"fullByte1":"09","fullByte2":"44","byte1":"0","byte2":"9","byte3":"4","byte4":"4"},"network":"15","id":"04","source":"FF","msg":"22","level":"4B","rate":"05"},"generated":"09441504FF224B0529","ctrlWord":{"byte1":0,"byte2":9,"byte3":4,"byte4":4},"type":"device","words":9,"network":21,"id":4,"msg":"22","cmd":"goto","checksum":"29","level":75,"rate":5}
}, function(err) {
  throw err;
});
```

### validCommands
An array of valid commands

**Example:**
```javascript
console.log(JSON.stringify(upb.validCommands));
// [20,"20","activate",21,"21","deactivate",22,"22","goto",23,"23","fadeStart",24,"24","fadeStop",25,"25","blink",26,"26","indicate",27,"27","toggle",30,"30","reportState",31,"31","storeState",80,"80","ackResponse",85,"85","setupTimeReport",86,"86","deviceStateReport",87,"87","deviceStatusReport",90,"90","registerValuesReport",91,"91","RAMvaluesReport",92,"92","rawDataReport",93,"93","heartbeatReport",143,"143","deviceSignatureReport"]
```

### commands
An object of all commands

**Example:**
```javascript
console.log(upb.commands);
/* { activate: 20,
     deactivate: 21,
     goto: 22,
     fadeStart: 23,
     fadeStop: 24,
     blink: 25,
     indicate: 26,
     toggle: 27,
     reportState: 30,
     storeState: 31,
     ackResponse: 80,
     setupTimeReport: 85,
     deviceStateReport: 86,
     deviceStatusReport: 87,
     registerValuesReport: 90,
     RAMvaluesReport: 91,
     rawDataReport: 92,
     heartbeatReport: 93,
     deviceSignatureReport: 143 } */
```

### defaultCommand
An object with the optional defaults.

**Example:**
```javascript
console.log(JSON.stringify(upb.defaultCommand));
// {"source":255,"sendx":1,"sendTime":1,"ackPulse":false,"idPulse":false,"ackMsg":false,"powerlineRepeater":0}
```

## More Information

I got most of the information the last three items listed on this Simply Automated page: [Tech Specs](http://www.simply-automated.com/tech_specs/). I also experimented with my serial terminal to see responses of other switches.

 - **UPB System Description** - This PDF describes all parts of the UPB protocol.
 - **UPB Command Wizard - Software** - This program lets you build commands with a wizard/GUI and see the result. It does not actually send the command, but it is very valuable for understanding the commands without reading too much of the above PDF.
 - **UPB Powerline Interface Module (PIM) - Description** - This PDF contains information about the PIM. It shows serial specifications (4800 baud 8-n-1) and PIM responses. It look me a while to figure out that the PIM always responds with `PE` whenever a command is not prefixed by the #20 character.
