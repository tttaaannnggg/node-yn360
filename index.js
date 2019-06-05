const noble = require('@abandonware/noble');

const ynLEDUUID='d104440b87cc';
const ynServiceUUID = ['f000aa6004514000b000000000000000']
const ynCharUUID = 'f000aa6104514000b000000000000000'
const adressForWrites = 'D1:04:44:0B:87:CC';
let ynPerp;
let ynChar;
const yn = {
  off: ()=> `AEEE00000056`,
  white: (cold = 00, warm = 00)=>`AEAA01${cold}${warm}56`,
  rgb: (r=00, g=00, b=00)=>`AEA1${r}${g}${b}56`,
  unknown: ()=>`AE3300000056`
}

function hexArr(str){
  const outArr = [];
  for(let i = 0; i < str.length; i+=2){
    outArr.push(parseInt(str.slice(0,i+2), 16));
  }
  return outArr;
}

noble.on('discover', handleDiscover);

function handleDiscover(perp){
  console.log('found peripheral');
  console.log('perp name is', perp.advertisement.localName);
  if(perp.advertisement.localName === 'YONGNUO LED'){
    ynPerp = perp;
    console.log('found YN360');
    perp.connect(handleConnect)
  }
}

function handleConnect(err){
  console.log('connection established');
  ynPerp.discoverAllServicesAndCharacteristics(handleServAndCharDiscov)}

function handleServAndCharDiscov(err, serv,chars){
  console.log('found services and characteristics')
  chars.forEach((item)=>{
    if (item.uuid === ynCharUUID){
      ynChar = item;
      console.log('attempting to send buffer!');
      console.log(yn.off());
      item.read(handleRead);
    }
  })
}

function handleRead(err, data){
  console.log('handleRead data is:', JSON.stringify(data));
  data = Buffer.from(hexArr(yn.off()));
  console.log('changed to', data);
  ynChar.write(data, true, function(err){
    console.log('error when sending buffer', err);
  });

}


noble.on('scanStop',()=>{
  console.log('scan is over');
})

noble.startScanning(ynServiceUUID);
