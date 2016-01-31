var bitcoin = require('bitcoinjs-lib');
var bigi = require('bigi');
var fs = require('fs');

//generating a bitcoin address from a hash
function generateAddress(stringToHash) {
  var hash = bitcoin.crypto.sha256(stringToHash);
  var d = bigi.fromBuffer(hash);

  var options = {
    compressed: false,
    network: bitcoin.networks.testnet
  }

  var keyPair = new bitcoin.ECPair(d, null, options);
  var address = keyPair.getAddress();
  var wif = keyPair.toWIF();

  console.log('addressInfo:', address);
  console.log('wif:', wif);

}

// var stringtoHash = process.argv[2];
//
// if (!stringtoHash) {
//   console.log('No string to hash provided.');
//   process.exit(0);
// }
//console.log('stringHashed:', stringtoHash);

//generateAddress(stringtoHash);


function getAddressFromWIF(wif) {

    var keyPair = bitcoin.ECPair.fromWIF(wif);
    var address = keyPair.getAddress();

    return address;
}




function getWIFFromKeyFile() {
  var keyInfo = JSON.parse(fs.readFileSync('testnet.key'));

  return keyInfo;
}

var keyInfo = getWIFFromKeyFile() {
  console.log(keyInfo);
}
