/* test/index.js
 * This is the main test file for node-upb.
 * https://github.com/DaAwesomeP/node-upb
 * 
 * Copyright 2016-present DaAwesomeP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }] */
'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var should = chai.should();
chai.use(chaiAsPromised);
var lint = require('mocha-eslint');
var upb = require('../lib');

var baseCmd = function() {
  return {
    network: 1,
    id: 1,
    type: 'device',
    cmd: 20,
    level: 100,
    toggleCount: 1,
    toggleRate: 50,
    blinkRate: 50,
    rate: 50,
    channel: 1,
    ackPulse: true,
    idPulse: true,
    ackMsg: true,
    sendTime: 2,
    sendx: 4
  };
};

lint([
  'lib',
  'test'
], require('../package.json').eslintConfig);

describe('upb.validCommands', function () {
  it('should be an array', function () {
    upb.validCommands.should.be.an('array');
  });
  it('should have one or more items', function () {
    upb.validCommands.length.should.be.at.least(1);
  });
});

describe('upb.defaultCommand', function () {
  it('should be an object', function () {
    upb.defaultCommand.should.be.an('object');
  });
});

describe('upb.util', function () {
  it('should be an object', function () {
    upb.util.should.be.an('object');
  });
});

describe('upb.util.pad', function () {
  it('should be a function', function () {
    upb.util.pad.should.be.a('function');
  });
  it('should pad 1 digit numbers', function () {
    upb.util.pad(0, 3, 1).should.equal('110');
  });
  it('should pad 4 character strings', function () {
    upb.util.pad('ello', 6, 'h').should.equal('hhello');
  });
  it('should pad with \'0\' by default', function () {
    upb.util.pad(0, 2).should.equal('00');
  });
  it('should do nothing if value too big', function () {
    upb.util.pad('no', 2).should.equal('no');
  });
});

//describe('upb.util.contains', function () {
//  it('should be a function', function () {
//    upb.util.pad.should.be.a('function');
//  });
//});

describe('upb.generateChecksum', function () {
  it('should be a function', function () {
    upb.generateChecksum.should.be.a('function');
  });
});

describe('upb.generate', function () {
  it('should be a function', function () {
    upb.generate.should.be.a('function');
  });
  it('should reject with no object argument', function () {
    return upb.generate().should.be.rejected;
  });
  it('should reject with non-object argument', function () {
    return upb.generate('nope').should.be.rejected;
  });
  it('should reject with no \'network\' parameter', function () {
    var testCmd = baseCmd();
    delete testCmd.network;
    return upb.generate(testCmd).should.be.rejected;
  });
  it('should reject with no \'id\' parameter', function () {
    var testCmd = baseCmd();
    delete testCmd.id;
    return upb.generate(testCmd).should.be.rejected;
  });
  it('should reject with no \'type\' parameter', function () {
    var testCmd = baseCmd();
    delete testCmd.type;
    return upb.generate(testCmd).should.be.rejected;
  });
  it('should reject with no \'cmd\' parameter', function () {
    var testCmd = baseCmd();
    delete testCmd.cmd;
    return upb.generate(testCmd).should.be.rejected;
  });
  it('should reject with unknown command', function () {
    var testCmd = Object.assign(baseCmd(), {
      cmd: 45
    });
    return upb.generate(testCmd).should.be.rejected;
  });
  it('should change \'powerlineRepeater\' from \'0\' to \'false\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      powerlineRepeater: 0
    });
    return upb.generate(testCmd).should.eventually.include({powerlineRepeater: false});
  });
  it('should change \'powerlineRepeater\' from \'true\' to \'1\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      powerlineRepeater: true
    });
    return upb.generate(testCmd).should.eventually.include({powerlineRepeater: 1});
  });
  it('should reject if \'powerlineRepeater\' is not valid', function () {
    var testCmd = Object.assign(baseCmd(), {
      powerlineRepeater: 5
    });
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if \'level\' is greater than \'100\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      level: 125
    });
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if \'level\' is less than \'0\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      level: -24
    });
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if \'sendTime\' is greater than \'sendx\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      sendTime: 5,
      sendx: 4
    });
    return upb.generate(testCmd).should.reject;
  });
  it('should set \'source\' to \'255\' by default\'', function () {
    var testCmd = baseCmd();
    return upb.generate(testCmd).should.eventually.include({source: 255});
  });
  it('should set \'source\' to \'255\' by default\'', function () {
    var testCmd = baseCmd();
    return upb.generate(testCmd).should.eventually.include({source: 255});
  });
  upb.validCommands.forEach(function(command) {
    var type, msg, cmd;
    if (typeof command === 'number') { type = 'integer'; msg = command; cmd = Object.keys(upb.commands).filter(function(key) {return upb.commands[key] === command;})[0]; }
    if (typeof command === 'string') { 
      if (isNaN(command)) { type = 'name'; msg = upb.commands[command]; cmd = command; }
      else { type = 'number in string'; msg = Number(command); cmd = Object.keys(upb.commands).filter(function(key) {return upb.commands[key] === Number(command);})[0]; }
    }
    it('should recognize \'' + cmd + '\' command (' + msg + ') by ' + type, function () {
      var testCmd = Object.assign(baseCmd(), {
        cmd: command
      });
      return upb.generate(testCmd).should.eventually.include({cmd: cmd, msg: msg});
    });
  });
  it('should reject if no \'level\' with \'goto\' command', function () {
    var testCmd = Object.assign(baseCmd(), {
      cmd: 'goto'
    });
    delete testCmd.level;
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if no \'level\' with \'fadeStart\' command', function () {
    var testCmd = Object.assign(baseCmd(), {
      cmd: 'fadeStart'
    });
    delete testCmd.level;
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if no \'level\' with \'deviceStateReport\' command', function () {
    var testCmd = Object.assign(baseCmd(), {
      cmd: 'deviceStateReport'
    });
    delete testCmd.level;
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if no \'blinkRate\' with \'blink\' command', function () {
    var testCmd = Object.assign(baseCmd(), {
      cmd: 'blink'
    });
    delete testCmd.blinkRate;
    return upb.generate(testCmd).should.reject;
  });
  it('should reject if no \'toggleCount\' with \'toggle\' command', function () {
    var testCmd = Object.assign(baseCmd(), {
      cmd: 'toggle'
    });
    delete testCmd.toggleCount;
    return upb.generate(testCmd).should.reject;
  });
  it('should recognize \'link\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      type: 'link'
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({type: 'link'}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble1.should.least(8);})
    ]);
  });
  it('should recognize \'powerlineRepeater\' when \'1\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      powerlineRepeater: 1
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({powerlineRepeater: 1}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble1.should.least(2);})
    ]);
  });
  it('should recognize \'powerlineRepeater\' when \'2\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      powerlineRepeater: 2
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({powerlineRepeater: 2}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble1.should.least(4);})
    ]);
  });
  it('should recognize \'powerlineRepeater\' when \'4\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      powerlineRepeater: 4
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({powerlineRepeater: 4}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble1.should.least(6);})
    ]);
  });
  it('should recognize \'ackPulse\' when \'true\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      ackPulse: true,
      idPulse: false,
      ackMsg: false
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({ackPulse: true}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble3.should.least(1);})
    ]);
  });
  it('should recognize \'ackPulse\' when \'false\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      ackPulse: false,
      idPulse: false,
      ackMsg: false
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({ackPulse: false}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble3.should.not.equal(1);})
    ]);
  });
  it('should recognize \'idPulse\' when \'true\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      ackPulse: false,
      idPulse: true,
      ackMsg: false
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({idPulse: true}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble3.should.least(2);})
    ]);
  });
  it('should recognize \'idPulse\' when \'false\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      ackPulse: false,
      idPulse: false,
      ackMsg: false
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({idPulse: false}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble3.should.not.equal(2);})
    ]);
  });
  it('should recognize \'ackMsg\' when \'true\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      ackPulse: false,
      idPulse: false,
      ackMsg: true
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({ackMsg: true}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble3.should.least(4);})
    ]);
  });
  it('should recognize \'ackMsg\' when \'false\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      ackPulse: false,
      idPulse: false,
      ackMsg: false
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({ackMsg: false}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble3.should.not.equal(4);})
    ]);
  });
  it('should recognize when \'sendx\' \'4\' and \'sendTime\' \'2\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      sendx: 4,
      sendTime: 2
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({sendx: 4, sendTime: 2}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble4.should.equal(13);})
    ]);
  });
  it('should recognize when \'sendx\' \'3\' and \'sendTime\' \'3\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      sendx: 3,
      sendTime: 3
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({sendx: 3, sendTime: 3}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble4.should.equal(10);})
    ]);
  });
  it('should recognize when \'sendx\' \'4\' and \'sendTime\' \'4\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      sendx: 4,
      sendTime: 4
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({sendx: 4, sendTime: 4}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble4.should.equal(15);})
    ]);
  });
  it('should recognize when \'sendx\' \'2\' and \'sendTime\' \'2\'', function () {
    var testCmd = Object.assign(baseCmd(), {
      sendx: 2,
      sendTime: 2
    });
    return Promise.all([
      upb.generate(testCmd).should.eventually.include({sendx: 2, sendTime: 2}),
      upb.generate(testCmd).then(function(result){result.ctrlWord.nibble4.should.equal(5);})
    ]);
  });
});

describe('upb.decode', function () {
  it('should be a function', function () {
    upb.decode.should.be.a('function');
  });
  it('should reject with no string argument', function () {
    return upb.decode().should.be.rejected;
  });
  it('should reject with non-string argument', function () {
    return upb.decode({uh:'no'}).should.be.rejected;
  });
});