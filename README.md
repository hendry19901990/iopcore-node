IoPcore Node
============

A IoP full node for building applications and services with Node.js. A node is extensible and can be configured to run additional services. At the minimum a node has an interface to [IoP Core v6.0.0b3](https://github.com/Internet-of-People/iop-core/releases) for more advanced address queries. Additional services can be enabled to make a node more useful such as exposing new APIs, running a block explorer and wallet service.

## Install

### Install Dependencies

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

```bash
git clone git@github.com:<yourusername>/iopcore-node.git
cd iopcore-node
npm install --unsafe-perm=true --allow-root
```

## Prerequisites

- IoP Core v6.0.0b3 with support for additional indexing *(see above)*
- Node.js v0.10, v0.12, v4 or v5
- mongodb 2.6.x
- ZeroMQ *(libzmq3-dev for Ubuntu/Debian or zeromq on OSX)*
- ~20GB of disk storage
- ~1GB of RAM

## Configuration

Iopcore includes a Command Line Interface (CLI) for managing, configuring and interfacing with your IoPcore Node.

```bash
iopcore-node.js create -d <iop-data-dir> mynode
cd mynode
../bin/iopcore-node.js install insight-api
../bin/iopcore-node.js install insight-ui
../bin/iopcore-node.js start
```

Create database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use blockchaindb

Create user with read/write access:

    > db.createUser( { user: "iquidus", pwd: "3xp!0reR", roles: [ "readWrite" ] } )

*note: If you're using mongo shell 2.4.x, use the following to create your user:

    > db.addUser( { user: "username", pwd: "password", roles: [ "readWrite"] })

### Syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

```bash
node sync.js
```	

This will create a directory with configuration files for your node and install the necessary dependencies.

Please note that [IoP Core v6.0.0b3](https://github.com/Internet-of-People/iop-core/releases) will be downloaded automatically. Once completed the iopd binary should be placed into the &lt;iop-data-dir&gt; folder specified during node creation.

For more information about (and developing) services, please see the [Service Documentation](docs/services.md).

## Add-on Services

There are several add-on services available to extend the functionality of IoPcore:

- [Insight API](https://github.com/hendry19901990/insight-api/tree/master)
- [Insight UI](https://github.com/hendry19901990/insight-ui/tree/master)

  
## License

Copyright 2017 IoP Community.

- bitcoin: Copyright (c) 2009-2015 Bitcoin Core Developers (MIT License)
