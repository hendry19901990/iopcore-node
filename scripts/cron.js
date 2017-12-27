const exec   = require('child_process').exec;

function execute(){
 try{
    exec('node sync.js', (error, stdout, stderr) => { 
      if (error !== null) 
        console.log(error);

	  if (stdout)
	    console.log(stdout);
    });
  }catch(e){}
  setTimeout(execute, 30000);
}

setTimeout(execute, 1000);