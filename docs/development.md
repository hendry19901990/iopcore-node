# Setting up Development Environment

## Install Node.js

Install Node.js by your favorite method, or use Node Version Manager by following directions at https://github.com/creationix/nvm

```bash
nvm install v4
```

## Fork and Download Repositories

To develop iopcore-node:

```bash
cd ~
git clone git@github.com:<yourusername>/iopcore-node.git
git clone git@github.com:<yourusername>/iopcore-lib.git
```

To develop iop-core or to compile from source:

```bash
git clone https://github.com/Internet-of-People/iop-core
git fetch origin <branchname>:<branchname>
git checkout <branchname>
```
**Note**: See IoP documentation for building IoP on your platform.


## Install Development Dependencies

For Ubuntu:
```bash
sudo apt-get install libzmq3-dev
sudo apt-get install build-essential
```
**Note**: Make sure that libzmq-dev is not installed, it should be removed when installing libzmq3-dev.


For Mac OS X:
```bash
brew install zeromq
```

## Install and Symlink

```bash
cd iopcore-lib
npm install
cd ../iopcore-node
npm install
```
**Note**: If you get a message about not being able to download IoP distribution, you'll need to compile iopd from source, and setup your configuration to use that version.


We now will setup symlinks in `iopcore-node` *(repeat this for any other modules you're planning on developing)*:
```bash
cd node_modules
rm -rf iopcore-lib
ln -s ~/iopcore-lib
rm -rf iopd-rpc-dash
ln -s ~/iopd-rpc-dash
```

And if you're compiling or developing IoP:
```bash
cd ../bin
ln -sf ~/iop-core/src/iopd
```

## Run Tests

If you do not already have mocha installed:
```bash
npm install mocha -g
```

To run all test suites:
```bash
cd iopcore-node
npm run regtest
npm run test
```

To run a specific unit test in watch mode:
```bash
mocha -w -R spec test/services/iopd.unit.js
```

To run a specific regtest:
```bash
mocha -R spec regtest/iopd.js
```

## Running a Development Node

To test running the node, you can setup a configuration that will specify development versions of all of the services:

```bash
cd ~
mkdir devnode
cd devnode
mkdir node_modules
touch iopcore-node.json
touch package.json
```

Edit `iopcore-node.json` with something similar to:
```json
{
  "network": "livenet",
  "port": 3001,
  "services": [
    "iopd",
    "web",
    "insight-api",
    "insight-ui",
    "<additional_service>"
  ],
  "servicesConfig": {
    "iopd": {
      "spawn": {
        "datadir": "/home/<youruser>/.IoP",
        "exec": "/home/<youruser>/iop-core/src/iopd"
      }
    }
  }
}
```

**Note**: To install services [insight-api](https://github.com/hendry19901990/insight-api-iop) and [insight-ui](https://github.com/hendry19901990/insight-ui-iop) you'll need to clone the repositories locally.

Setup symlinks for all of the services and dependencies:

```bash
cd node_modules
ln -s ~/iopcore-lib
ln -s ~/iopcore-node
ln -s ~/insight-api
ln -s ~/insight-ui
```

Make sure that the `<datadir>/IoP.conf` has the necessary settings, for example:
```
server=1
whitelist=127.0.0.1
txindex=1
addressindex=1
timestampindex=1
spentindex=1
zmqpubrawtx=tcp://127.0.0.1:28332
zmqpubhashblock=tcp://127.0.0.1:28332
rpcallowip=127.0.0.1
rpcuser=bitcoin
rpcpassword=local321
```

From within the `devnode` directory with the configuration file, start the node:
```bash
../iopcore-node/bin/iopcore-node start
```