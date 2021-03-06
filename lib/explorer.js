var request = require('request')
  , settings = require('./settings')
  , Address = require('../models/address');
var IopRPC = require('iopd-rpc');
var mongoose = require('mongoose');

var base_url = 'http://127.0.0.1:' + settings.port + '/api/';

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

var DEFAULT_CONFIG_SETTINGS = {
  server: 1,
  whitelist: '127.0.0.1',
  txindex: 1,
  addressindex: 1,
  timestampindex: 1,
  spentindex: 1,
  zmqpubrawtx: 'tcp://127.0.0.1:28332',
  zmqpubrawtxlock: 'tcp://127.0.0.1:28332',
  zmqpubhashblock: 'tcp://127.0.0.1:28332',
  rpcallowip: '127.0.0.1',
  rpcuser: 'iopuser',
  rpcpassword: 'iop159951',
  rpcport: 9998, 
  uacomment: 'iopcore'
};

var client = new IopRPC({
      protocol: 'http',
      host: '127.0.0.1',
      port: DEFAULT_CONFIG_SETTINGS.rpcport,
      user: DEFAULT_CONFIG_SETTINGS.rpcuser,
      pass: DEFAULT_CONFIG_SETTINGS.rpcpassword,
      rejectUnauthorized: true
    });

// returns coinbase total sent as current coin supply
function coinbase_supply(cb) {
  mongoose.connect(dbString, function(err_) {
	if (err_ && mongoose.connection.readyState == 0){
	    return cb(-1);
	}else{
		Address.findOne({a_id: 'coinbase'}, function(err, address) {
		  if (address) {
			return cb(address.sent);
		  } else {
			return cb(0);
		  }
		 });
	 }
	 
  });
  
}

module.exports = {
	
   richt_list_count: function(cb){
	  mongoose.connect(dbString, function(err_) {
		  if (err_ && mongoose.connection.readyState == 0){
			return cb(null);
		  }else{
			  Address.count(function(err, res) {
				  if (err){
					  return cb(null);
				  }else{
					 Address.findOne({a_id: 'coinbase'}, function(err__, address) {
						  if (address) {
							return cb({totalsupply: address.sent, count: res});
						  } else {
							return cb(null);
						  }
					 });
				  }
			  });
		  }
	  });
   },
	
  richt_list: function(pageNumber, cb){

        var nPerPage = 20;
        pageNumber = (pageNumber >0) ? (pageNumber-1)*nPerPage: 0;

        mongoose.connect(dbString, function(err_) {
		  if (err_ && mongoose.connection.readyState == 0){
			return cb(-1);
		  }else{
			Address.find({}).select('a_id').sort({balance: -1}).skip(pageNumber).limit(nPerPage).exec(function(err, addressList) {
				if (addressList) {			 
					 Address.aggregate([
					  {$match: { _id: { 
						$in: addressList.map(function(id){ return new mongoose.Types.ObjectId(id._id); })
					  }}},
					  { $project: {a_id:1, balance:1, sizetxs:{$size: "$txs"}} },
                                          {$sort: {balance: -1} }
					  ], function(err, result) {
						  if (result) {
							return cb(result);
						  } else {
							return cb(-1);
						  }
					 });
					 
			   } else {
				return cb(-1);
			   }
			});
		   }
         });

   },

  convert_to_satoshi: function(amount, cb) {
    // fix to 8dp & convert to string
    var fixed = amount.toFixed(8).toString(); 
    // remove decimal (.) and return integer 
    return cb(parseInt(fixed.replace('.', '')));
  },

  get_hashrate: function(cb) {
    if (settings.index.show_hashrate == false) return cb('-');
      client.getMiningInfo(function (error, response) { //returned in mhash
        if (!error) {
		  var body = response.result;
          if (settings.nethash_units == 'K') {
            return cb((body.netmhashps * 1000).toFixed(4));
          } else if (settings.nethash_units == 'G') {
            return cb((body.netmhashps / 1000).toFixed(4));
          } else if (settings.nethash_units == 'H') {
            return cb((body.netmhashps * 1000000).toFixed(4));
          } else if (settings.nethash_units == 'T') {
            return cb((body.netmhashps / 1000000).toFixed(4));
          } else if (settings.nethash_units == 'P') {
            return cb((body.netmhashps / 1000000000).toFixed(4));
          } else {
            return cb(body.netmhashps.toFixed(4));
          }
        } else {
          return cb('-');
        }
      });
  },


  get_difficulty: function(cb) {
    client.getDifficulty(function (error, response) {
      return cb(response.result);
    });
  },

  get_connectioncount: function(cb) {
    client.getConnectionCount(function (error, response) {
      return cb(response.result);
    });
  },

  get_blockcount: function(cb) {
    client.getBlockCount(function (error, response) {
      return cb(response.result);
    });
  },

  get_blockhash: function(height, cb) {
    client.getBlockHash(height, function (error, response) {
      return cb(response.result);
    });
  },

  get_block: function(hash, cb) {
    client.getBlock(hash, true, function (error, response) {
      return cb(response.result);
    });
  },

  get_rawtransaction: function(hash, cb) {
    client.getRawTransaction(hash, 1, function (error, response) {
      return cb(response.result);
    });
  },

  /* It's not necessary */
  get_maxmoney: function(cb) {
    var uri = base_url + 'getmaxmoney';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_maxvote: function(cb) {
    var uri = base_url + 'getmaxvote';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_vote: function(cb) {
    var uri = base_url + 'getvote';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_phase: function(cb) {
    var uri = base_url + 'getphase';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_reward: function(cb) {
    var uri = base_url + 'getreward';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_estnext: function(cb) {
    var uri = base_url + 'getnextrewardestimate';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },

  get_nextin: function(cb) {
    var uri = base_url + 'getnextrewardwhenstr';
    request({uri: uri, json: true}, function (error, response, body) {
      return cb(body);
    });
  },
  /* It's not necessary */
  
  
  // synchonous loop used to interate through an array, 
  // avoid use unless absolutely neccessary
  syncLoop: function(iterations, process, exit){
    var index = 0,
        done = false,
        shouldExit = false;
    var loop = {
      next:function(){
          if(done){
              if(shouldExit && exit){
                  exit(); // Exit if we're done
              }
              return; // Stop the loop if we're done
          }
          // If we're not finished
          if(index < iterations){
              index++; // Increment our index
              if (index % 100 === 0) { //clear stack
                setTimeout(function() {
                  process(loop); // Run our process, pass in the loop
                }, 1);
              } else {
                 process(loop); // Run our process, pass in the loop
              }
          // Otherwise we're done
          } else {
              done = true; // Make sure we say we're done
              if(exit) exit(); // Call the callback on exit
          }
      },
      iteration:function(){
          return index - 1; // Return the loop number we're on
      },
      break:function(end){
          done = true; // End the loop
          shouldExit = end; // Passing end as true means we still call the exit callback
      }
    };
    loop.next();
    return loop;
  },

  balance_supply: function(cb) {
	mongoose.connect(dbString, function(err_) {
		if (err_ && mongoose.connection.readyState == 0)
	      return cb(-1);
	
        Address.find({}, 'balance').where('balance').gt(0).exec(function(err, docs) { 
           var count = 0;
           module.exports.syncLoop(docs.length, function (loop) {
            var i = loop.iteration();
            count = count + docs[i].balance;
            loop.next();
           }, function(){
              return cb(count);
           });
        });
    });
  },
  
  find_address: function(hash, cb) {
	  mongoose.connect(dbString, function(err_) {
		  if (err_ && mongoose.connection.readyState == 0)
			return cb();
		
		  Address.findOne({a_id: hash}, function(err, address) {
			if(address) {
			  return cb(address);
			} else {
			  return cb();
			}
		  });
	  });
  },

  get_supply: function(cb) {
    if ( settings.supply == 'HEAVY' ) {
      var uri = base_url + 'getsupply';
      request({uri: uri, json: true}, function (error, response, body) {
        return cb(body);
      });
    } else if (settings.supply == 'GETINFO') {
      var uri = base_url + 'getinfo';
      request({uri: uri, json: true}, function (error, response, body) {
        return cb(body.moneysupply);
      });
    } else if (settings.supply == 'BALANCES') {
      module.exports.balance_supply(function(supply) {
        return cb(supply/100000000);
      });
    } else if (settings.supply == 'TXOUTSET') {
      var uri = base_url + 'gettxoutsetinfo';
      request({uri: uri, json: true}, function (error, response, body) {
        return cb(body.total_amount);
      });
    } else {
      coinbase_supply(function(supply) {
        return cb(supply/100000000);
      });
    }
  },

  is_unique: function(array, object, cb) {
    var unique = true;
    var index = null;
    module.exports.syncLoop(array.length, function (loop) {
      var i = loop.iteration();
      if (array[i].addresses == object) {
        unique = false;
        index = i;
        loop.break(true);
        loop.next();
      } else {
        loop.next();
      }
    }, function(){
      return cb(unique, index);
    });
  },

  calculate_total: function(vout, cb) {
    var total = 0;
    module.exports.syncLoop(vout.length, function (loop) {
      var i = loop.iteration();
      //module.exports.convert_to_satoshi(parseFloat(vout[i].amount), function(amount_sat){
        total = total + vout[i].amount;
        loop.next();
      //});
    }, function(){
      return cb(total);
    });
  },

  prepare_vout: function(vout, txid, vin, cb) {
    var arr_vout = [];
    var arr_vin = [];
    arr_vin = vin;
    module.exports.syncLoop(vout.length, function (loop) {
      var i = loop.iteration();
      // make sure vout has an address
      if (vout[i].scriptPubKey.type != 'nonstandard' && vout[i].scriptPubKey.type != 'nulldata') { 
        // check if vout address is unique, if so add it array, if not add its amount to existing index
        //console.log('vout:' + i + ':' + txid);
        module.exports.is_unique(arr_vout, vout[i].scriptPubKey.addresses[0], function(unique, index) {
          if (unique == true) {
            // unique vout
            module.exports.convert_to_satoshi(parseFloat(vout[i].value), function(amount_sat){
              arr_vout.push({addresses: vout[i].scriptPubKey.addresses[0], amount: amount_sat});
              loop.next();
            });
          } else {
            // already exists
            module.exports.convert_to_satoshi(parseFloat(vout[i].value), function(amount_sat){
              arr_vout[index].amount = arr_vout[index].amount + amount_sat;
              loop.next();
            });
          }
        });
      } else {
        // no address, move to next vout
        loop.next();
      }
    }, function(){
      if (vout[0].scriptPubKey.type == 'nonstandard') {
        if ( arr_vin.length > 0 && arr_vout.length > 0 ) {
          if (arr_vin[0].addresses == arr_vout[0].addresses) {
            //PoS
            arr_vout[0].amount = arr_vout[0].amount - arr_vin[0].amount;
            arr_vin.shift();
            return cb(arr_vout, arr_vin);
          } else {
            return cb(arr_vout, arr_vin);
          }
        } else {
          return cb(arr_vout, arr_vin);
        }
      } else {
        return cb(arr_vout, arr_vin);
      }
    });
  },

  get_input_addresses: function(input, vout, cb) {
    var addresses = [];
    if (input.coinbase) {
      var amount = 0;
      module.exports.syncLoop(vout.length, function (loop) {
        var i = loop.iteration();
          amount = amount + parseFloat(vout[i].value);  
          loop.next();
      }, function(){
        addresses.push({hash: 'coinbase', amount: amount});
        return cb(addresses);
      });
    } else {
      module.exports.get_rawtransaction(input.txid, function(tx){
        if (tx) {
          module.exports.syncLoop(tx.vout.length, function (loop) {
            var i = loop.iteration();
            if (tx.vout[i].n == input.vout) {
              //module.exports.convert_to_satoshi(parseFloat(tx.vout[i].value), function(amount_sat){
              if (tx.vout[i].scriptPubKey.addresses) {
                addresses.push({hash: tx.vout[i].scriptPubKey.addresses[0], amount:tx.vout[i].value});  
              }
                loop.break(true);
                loop.next();
              //});
            } else {
              loop.next();
            } 
          }, function(){
            return cb(addresses);
          });
        } else {
          return cb();
        }
      });
    }
  },

  prepare_vin: function(tx, cb) {
    var arr_vin = [];
    module.exports.syncLoop(tx.vin.length, function (loop) {
      var i = loop.iteration();
      module.exports.get_input_addresses(tx.vin[i], tx.vout, function(addresses){
        if (addresses && addresses.length) {
          //console.log('vin');
          module.exports.is_unique(arr_vin, addresses[0].hash, function(unique, index) {
            if (unique == true) {
              module.exports.convert_to_satoshi(parseFloat(addresses[0].amount), function(amount_sat){
                arr_vin.push({addresses:addresses[0].hash, amount:amount_sat});
                loop.next();
              });
            } else {
              module.exports.convert_to_satoshi(parseFloat(addresses[0].amount), function(amount_sat){
                arr_vin[index].amount = arr_vin[index].amount + amount_sat;
                loop.next();
              });
            }
          });
        } else {
          loop.next();
        }
      });
    }, function(){
      return cb(arr_vin);
    });
  }
};
