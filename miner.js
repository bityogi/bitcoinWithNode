var sha256 = require('sha256');
var convertHex = require('convert-hex');
var bufferpack = require('bufferpack');
var moment = require('moment');
var buffertools = require('buffertools');


function sha256d(data) {
  console.log('sha256d called with data:', data);
  return sha256d(sha256d(data).digest()).digest();
}

function internal2rpc(hash) {
  //reverse string
  return buffertools.reverse(hash).toString('hex');
}

var version = bufferpack.pack('<L', '0x01');

console.log(version);

var previousHeaderHash = new Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex');

console.log(previousHeaderHash);

var txID = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';
var merkle_root = buffertools.reverse(new Buffer(txID, 'hex'));

console.log(merkle_root);

var date = Math.floor(new Date('3 Jan 2009 18:15:05 UTC') / 1000);

console.log('date:', date);

var packedDate = bufferpack.pack('<L', date)

console.log('packedDate:', packedDate);

var nbits = bufferpack.pack('<L', 0x1d00ffff);

console.log('nbits:', nbits);

var reverse_nbits = buffertools.reverse(nbits);

console.log('reverse_nbits:', reverse_nbits);

var nbitsCalc = reverse_nbits.toString('hex');

console.log('nbitsCalc:', nbitsCalc);

var base = 256;

var exponent = parseInt(nbitsCalc.toString('binary', 0, 2), 16) - 3;

console.log('exponent:', exponent);

var significand = parseInt(nbitsCalc.toString('binary', 2, 8), 16);

console.log('significand:', significand);

var target = significand * ( Math.pow(base, exponent) );

console.log('target:', target);

var nonce = 0x7c2bac10;

while (nonce < 0x7c2bac1e) {
  var header = (
    version
    + previousHeaderHash
    + merkle_root
    + date
    + nbits
    + bufferpack.pack('<L', nonce)
  )

  var header_hash = sha256d(header);

  if ( parseInt(buffertools.reverse(header_hash).toString('hex'), 16) < target) {
    console.log('nonce          Header Hash');
    console.log(nonce, internal2rpc(header_hash));

    break;
  }
  console.log('target not met. incrementing nonce.');

  nonce += 1;
}
