const noble = require('@abandonware/noble');


// YN360 has a Generic Access service with two attributes
const genAccess = 1800;
const ynLEDUUID='d104440b87cc';
const ynServiceUUID = ['f000aa6004514000b000000000000000']
let ynPerp;
const yn = {
  off: ()=> `AEEE00000056`,
  white: (cold = 00, warm = 00)=>`AEAA01${cold}${warm}56`,
  rgb: (r=00, g=00, b=00)=>`AEA1${r}${g}${b}56`,
  unknown: ()=>`AE3300000056`
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
  //console.log('checking ynPerp', ynPerp);
  ynPerp.discoverServices(['180a'], (err, serv)=>{
    console.log('services are', serv);
  })
}


noble.on('scanStop',(x)=>{
  console.log('scan is over. cb takes this:', x);
})

noble.startScanning(ynServiceUUID);
