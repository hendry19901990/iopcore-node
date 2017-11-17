var mongoose = require('mongoose')
  , db = require('../lib/database')
  , Tx = require('../models/tx')  
  , Address = require('../models/address')  
  , Richlist = require('../models/richlist')  
  , Stats = require('../models/stats')  
  , settings = require('../lib/settings')
  , fs = require('fs');
  
var process = require('process');

var mode = 'update';
var database = 'index';

function create_lock(cb) {
  if ( database == 'index' ) {
    var fname = database + '.pid';
    fs.appendFile(fname, process.pid, function (err) {
      if (err) {
        console.log("Error: unable to create %s", fname);
        process.exit(1);
      } else {
        return cb();
      }
    });
  } else {
    return cb();
  }
}

function remove_lock(cb) {
  if ( database == 'index' ) {
    var fname =  database + '.pid';
    fs.unlink(fname, function (err){
      if(err) {
        console.log("unable to remove lock: %s", fname);
        process.exit(1);
      } else {
        return cb();
      }
    });
  } else {
    return cb();
  }  
}

function is_locked(cb) {
  if ( database == 'index' ) {
    var fname = database + '.pid';
    fs.exists(fname, function (exists){
      if(exists) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  } else {
    return cb();
  } 
}

function exit() {
  remove_lock(function(){
    mongoose.disconnect();
    process.exit(0);
  });
}

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

is_locked(function (exists) {
  if (exists) {
    console.log("Script already running..");
    process.exit(0);
  } else {
    create_lock(function (){
      console.log("script launched with pid: " + process.pid);
      mongoose.connect(dbString, function(err) {
        if (err) {
          console.log('Unable to connect to database: %s', dbString);
          console.log('Aborting');
          exit();
        } else if (database == 'index') {
          createCheck_stats(function() {
              db.update_db(settings.coin, function(){
                db.get_stats(settings.coin, function(stats){
                  if (settings.heavy == true) {
                    db.update_heavy(settings.coin, stats.count, 20, function(){
                    
                    });
                  }
                  if (mode == 'reindex') {
                    Tx.remove({}, function(err) { 
                      Address.remove({}, function(err2) { 
                        Richlist.update({coin: settings.coin}, {
                          received: [],
                          balance: [],
                        }, function(err3) { 
                          Stats.update({coin: settings.coin}, { 
                            last: 0,
                          }, function() {
                            console.log('index cleared (reindex)');
                          }); 
                          db.update_tx_db(settings.coin, 1, stats.count, settings.update_timeout, function(){
                            db.update_richlist('received', function(){
                              db.update_richlist('balance', function(){
                                db.get_stats(settings.coin, function(nstats){
                                  console.log('reindex complete (block: %s)', nstats.last);
                                  exit();
                                });
                              });
                            });
                          });
                        });
                      });
                    });              
                  } else if (mode == 'check') {
                    db.update_tx_db(settings.coin, 1, stats.count, settings.check_timeout, function(){
                      db.get_stats(settings.coin, function(nstats){
                        console.log('check complete (block: %s)', nstats.last);
                        exit();
                      });
                    });
                  } else if (mode == 'update') {
                    db.update_tx_db(settings.coin, stats.last, stats.count, settings.update_timeout, function(){
                      db.update_richlist('received', function(){
                        db.update_richlist('balance', function(){
                          db.get_stats(settings.coin, function(nstats){
                            console.log('update complete (block: %s)', nstats.last);
                            exit();
                          });
                        });
                      });
                    });
                  }
                });
              });
             
			
          });
        }
		
      });
    });
  }
});

function createCheck_stats(cb){
	db.check_stats(settings.coin, function(exists) {
		if (exists == false) {
		    console.log('no stats entry found, creating now..');
		    db.create_stats(settings.coin, function(){
			  console.log('stats entry created successfully.');
			  db.check_richlist(settings.coin, function(exists_richlist){
				if (exists_richlist == false) {
				    console.log('no richlist entry found, creating now..');
				    db.create_richlist(settings.coin, function() {
					   cb();
				    });
				}else{
					cb();
				}			  
			  });
		    });
		}else{
		    cb();
		}
	});
}