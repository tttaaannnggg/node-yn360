const noble = require('@abandonware/noble');

const light = {
  UUIDs:{
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
    hex: null
  }
}

function toHexArr(str){
  const outArr = [];
  for(let i = 0; i < str.length; i+=2){
    outArr.push(parseInt(str.slice(0,i+2), 16));
  }
  return outArr;
}

light.createMessage= (mode, vals = [00,00,00])=>{
  console.log('mode is', mode)
  switch(mode){
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
  console.log('lastMessage is', light.lastMessage)
  light.lastMessage.mode = mode;
  light.lastMessage.hex = toHexArr(light.lastMessage.hex);
  return light.lastMessage.hex
}

light.handleDiscover = function(perp){
  console.log('found peripheral');
  console.log('perp name is', perp.advertisement.localName);
  if(perp.advertisement.localName === 'YONGNUO LED'){
    light.ynPerp = perp;
    console.log('found YN360');
    perp.connect(light.handleConnect)
  }
}

light.handleConnect = function(err){
  console.log('connection established');
  light.ynPerp.discoverAllServicesAndCharacteristics(light.handleServAndCharDiscov)
}

light.handleServAndCharDiscov = function(err, serv,chars){
  console.log('found services and characteristics')
  console.log(light.UUIDs.chr)
  chars.forEach((item)=>{
    if (item.uuid === light.UUIDs.chr){
      light.ynChar = item;
      console.log('attempting to send buffer!');
      item.read(light.handleRead);
    }
  })
}

light.handleRead = function(err, data){
  console.log('handleRead data is:', JSON.stringify(data));
  light.lastMessage.buf = Buffer.from(light.createMessage(light.mode, light.vals));
  console.log('changed to', light.lastMessage.buf);
  light.ynChar.write(light.lastMessage.buf, true, function(err){
    console.log('error when sending buffer', err);
  });
}

light.sendWrite = function(options = {mode:'rgb', vals:[00,00,00]}, cb){
  [light.mode, light.vals] = [options.mode, options.vals];
  console.log('beginning send')
  noble.on('discover', light.handleDiscover);
  noble.startScanning(light.UUIDs.service);
  noble.on('scanStop', (err)=>{
    console.log('scan is over');
    return cb(err, light.getState());
  })
}

light.getState = function(){
  const {UUIDs, mode, vals, ynPerp, ynChar, lastMessage} = light;
  return {
    UUIDs,
    mode,
    vals,
    ynPerp,
    ynChar,
    lastMessage
  }:
}

light.sendWrite('white', [00,99]);

module.exports = light;
