const os = require('os');

const interfaces = os.networkInterfaces();
let localIp = '127.0.0.1';

for (const interfaceName in interfaces) {
  const addresses = interfaces[interfaceName];
  for (const address of addresses) {
    if (address.family === 'IPv4' && !address.internal) {
      localIp = address.address;
      break;
    }
  }
  if (localIp !== '127.0.0.1') {
    break;
  }
}

console.log('IP:' + localIp);
