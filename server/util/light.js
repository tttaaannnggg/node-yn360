//importing noble
const noble = require('@abandonware/noble');

//light will be an object that hangs on to all
//data that we want to persist clientside
//which is related to the light
//the UUIDs prop is hardcoded with values corresponding to the YN360
const light = {
  UUIDs: {
    led: 'd104440b87cc',
    service: ['f000aa6004514000b000000000000000'],
    chr: 'f000aa6104514000b000000000000000',
  },
  mode: null,
  vals: null,
  ynPerp: null,
  ynChar: null,
  lastMessage: {
    mode: '',
    hex: null,
  },
};

//converts a hex string to an array of hex values (ints)
//in order to send over BLE and be read by the YN-360
function toHexArr(str) {
  const outArr = [];
  for (let i = 0; i < str.length; i += 2) {
    outArr.push(parseInt(str.slice(0, i + 2), 16));
  }
  return outArr;
}

//takes in a 'mode' and arr of values
//generates hexadecimal strings that will be parsed to hex arrays
//and sent over to the YN360
//valid modes are 'white', 'off', and 'rgb'
// the unknown mode is a feature that's available on the YN-360 hardware
// but we don't know what it does.
light.createMessage = (mode, vals = [00, 00, 00]) => {
  console.log('mode is', mode);
  switch (mode) {
    case 'white':
      light.lastMessage.hex = `AEAA01${vals[0]}${vals[1]}56`;
      break;
    case 'off':
      light.lastMessage.hex = `AEEE00000056`;
      break;
    case 'rgb':
      light.lastMessage.hex = `AEA1${vals[0]}${vals[1]}${vals[2]}56`;
      break;
    case 'unknown':
      light.lastMessage.hex = 'AE3300000056';
      break;
    default:
      console.log(`case ${mode} not recognized!`);
  }
  light.lastMessage.mode = mode;
  light.lastMessage.hex = toHexArr(light.lastMessage.hex);
  return light.lastMessage.hex;
};

//sendwrite kicks off the chain of callbacks
light.sendWrite = function(mode, vals = [00, 00, 00]) {
  light.mode = mode;
  light.vals = vals;
  console.log('beginning send');
  noble.on('discover', light.handleDiscover);
  noble.startScanning(light.UUIDs.service);
  noble.on('scanStop', () => {
    console.log('scan is over');
  });
};

//event listener once you find a BLE device
//if it's a YN LED, you connect
//then save the perp that you're getting via DI from noble.on
//then fire off to the next CB by connecting to the peripheral
light.handleDiscover = function(perp) {
  console.log('found peripheral');
  console.log('perp name is', perp.advertisement.localName);
  if (perp.advertisement.localName === 'YONGNUO LED') {
    light.ynPerp = perp;
    console.log('found YN360');
    perp.connect(light.handleConnect);
  }
};

//once you've decided to connect
//it grabs the peripheral from the saved dependency
//then it discovers all services and characteristics on that peripheral
//firing off the next callback once it does
light.handleConnect = function(err) {
  console.log('connection established');
  light.ynPerp.discoverAllServicesAndCharacteristics(
    light.handleServAndCharDiscov,
  );
};

//here, services and characteristics are injected
//we're gonna look at all of the characteristics
//once we find a matching UUID, we generate a buffer and write it to the light
light.handleServAndCharDiscov = function(err, serv, chars) {
  console.log('found services and characteristics');
  chars.forEach(item => {
    if (item.uuid === light.UUIDs.chr) {
      light.ynChar = item;
      console.log('attempting to send buffer!');
      light.lastMessage.buf = Buffer.from(
        light.createMessage(light.mode, light.vals),
      );
      console.log('changed to', light.lastMessage.buf);
      light.ynChar.write(light.lastMessage.buf, true, light.handleWrite);
    }
  });
};

// just catches errors at the end
light.handleWrite = function(err) {
  if (err) {
    console.log('error when sending buffer', err);
  } else {
    console.log('finished writing!');
  }
};

light.sendWrite('rgb',[99,25,99]);

module.exports = light;
