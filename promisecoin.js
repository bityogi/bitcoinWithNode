var bitcoin = require('bitcoin');
var Q = require('q');



var client = new bitcoin.Client({
  host:'localhost',
  port:8332,
  user:'bitcoinrpc',
  pass:'3QtnxrB7P5y4EpBdad1MkCeB2RHmArvcarw7udgXsAce'
});

var bip100re = new RegExp('BIP100|BV[0-9]{7}');
var bip100Support = 0;
var notBip100Support = 0;
var blocksChecked = 0;
var blocksToLoop = 10;
var previousBlockHash = '';

function getBestBlock() {
  var defer = Q.defer();
  client.getBestBlockHash(function(err, data) {
    if (err) {
      defer.reject(error);
    } else {
      console.log('data from getBestBlock:', data);
      defer.resolve(data);
    }
  });
  return defer.promise;
}


function getBlock(blockHash) {
  var defer = Q.defer();
  client.getBlock(blockHash, function(err, data) {
    if (err) {
      defer.reject(err);
    } else {
      console.log('[getBlock] coinbaseTransactionId %s, previousBlockHash %s', data.tx[0], data.previousblockhash);
      defer.resolve({ 'coinbaseTransactionId': data.tx[0], 'previousBlockHash': data.previousblockhash });
    }
  });
  return defer.promise;
}

function getRawTransaction(transactionId) {
  var defer = Q.defer();
  client.getRawTransaction(transactionId, 1, function(err, data) {
    if (err) {
      defer.reject(err);
    } else {
      //console.log('[getRawTransaction] data from getRawTransaction:', data);
      defer.resolve(data);
    }
  });
  return defer.promise;
}

function checkCoinBaseValue(transaction) {
  var coinbaseValue = transaction.vin[0].coinbase;
  console.log('coinbaseValue:', coinbaseValue);
  var coinbaseValueInBinary = new Buffer(coinbaseValue, 'hex')
  //console.log('coinbase binary field:', coinbaseValueInBinary);

  if (bip100re.test(coinbaseValueInBinary)) {
    console.log('test is positive. BIP100 supported');
    return true;
  } else {
    console.log('NACK. No support here.');
    return false;
  }

}

function getBIPSupport() {

  function recurseThroughBlocks(hash) {
    var defer = Q.defer();

    getBlock(hash)
      .then(function(blockinfo) {
        //console.log('blockinfo:', blockinfo);
        previousBlockHash = blockinfo.previousBlockHash;

        return getRawTransaction(blockinfo.coinbaseTransactionId);
      })
      .then(function(transaction) {
        if (checkCoinBaseValue(transaction)) {
          bip100Support++;
        } else {
          notBip100Support++;
        }
      }).then(function() {
        blocksChecked++
        if (blocksChecked < blocksToLoop) {
          console.log('blocks checked:', blocksChecked);
          recurseThroughBlocks(previousBlockHash);
        } else if (blocksChecked == blocksToLoop) {
          console.log('COMPLETED BLOCK CHECKS!!!');
          defer.resolve(blocksChecked);
        }
      });

      return defer.promise;

  }

  getBestBlock()
    .then(function(hash) {
      return recurseThroughBlocks(hash);
      console.log('after the recursion');
    })
    .then(function(value) {
      console.log('NEXT PROMISE AFTER RECURSION!!!');
      console.log('checked:', value);
    })
    .catch(function(err) {
      console.log('error:', err);
      console.log(err.stack);
    });


}

getBIPSupport();
  // .then(function(info) {
  //   console.log('blocks checked:', info.blocksChecked);
  //   console.log('END');
  // })
