const noble = require('@abandonware/noble');

const Light = function(){
  this.UUIDs={
    led: 'd104440b87cc',
    service: ['f000aa6004514000b000000000000000'],
    chr: 'f000aa6104514000b000000000000000',
  }
  this.ynPerp = null;
  this.ynChar = null;
  this.lastMessage = {
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

Light.prototype.createMessage= function(mode, vals = [00,00,00]){
  switch(mode){
    case 'white':
      this.lastMessage.hex = `AEAA01${vals[0]}${vals[1]}56`;
    case 'off':
      this.lastMessage.hex = `AEEE00000056`;
    case 'rgb':
      this.lastMessage.hex = `AEA1${vals[0]}${vals[1]}${vals[2]}56`;
    case 'unknown':
      this.lastMessage.hex = 'AE3300000056';
    default:
      return console.log(`case ${mode} not recognized!`);
  }
  this.lastMessage.mode = mode;
  this.lastMessage.hex = toHexArr(btMsg);
}

Light.prototype.handleDiscover = function(perp){
  console.log('found peripheral');
  console.log('perp name is', perp.advertisement.localName);
  if(perp.advertisement.localName === 'YONGNUO LED'){
    this.ynPerp = perp;
    console.log('found YN360');
    console.log('checking if we have handleConnect', this.handleConnect);
    perp.connect(this.handleConnect)
  }
}
Light.prototype.handleConnect = function(err){
  console.log('this is', this.ynPerp);
  console.log('connection established');
  console.log('checking if we have cb, ', this.handleServAndCharDiscov);
  this.ynPerp.discoverAllServicesAndCharacteristics(this.handleServAndCharDiscov)
}

Light.prototype.handleServAndCharDiscov = function(err, serv,chars){
  console.log('found services and characteristics')
  console.log(this.UUIDs.chr)
  chars.forEach((item)=>{
    if (item.uuid === this.UUIDs.chr){
      this.ynChar = item;
      console.log('attempting to send buffer!');
      item.read(handleRead);
    }
  })
}

Light.prototype.handleRead = function(err, data){
  console.log('handleRead data is:', JSON.stringify(data));
  this.lastMessage.buf = Buffer.from(this.createMessage(mode, vals));
  console.log('changed to', this.lastMesssage.buf);
  this.ynChar.write(this.lastMessage.buf, true, function(err){
    console.log('error when sending buffer', err);
  });
}

Light.prototype.sendWrite = function(mode, vals = [00,00,00]){
  console.log('beginning send')
  noble.on('discover', this.handleDiscover);
  noble.startScanning(this.UUIDs.service);
  noble.on('scanStop',()=>{
    console.log('scan is over');
  })
}

const light = new Light();

light.sendWrite('off', [99,99]);


