IoPcore Node
============

A IoP full node for building applications and services with Node.js. A node is extensible and can be configured to run additional services. At the minimum a node has an interface to [IoP Core v6.0.0b3](https://github.com/Internet-of-People/iop-core/releases) for more advanced address queries. Additional services can be enabled to make a node more useful such as exposing new APIs, running a block explorer and wallet service.

## Install

```bash
npm install -g iopcore-node
```

## Prerequisites

- IoP Core v6.0.0b3 with support for additional indexing *(see above)*
- Node.js v0.10, v0.12, v4 or v5
- ZeroMQ *(libzmq3-dev for Ubuntu/Debian or zeromq on OSX)*
- ~20GB of disk storage
- ~1GB of RAM

## Configuration

Iopcore includes a Command Line Interface (CLI) for managing, configuring and interfacing with your IoPcore Node.

```bash
iopcore-node create -d <iop-data-dir> mynode
cd mynode
iopcore-node install <service>
iopcore-node install https://github.com/yourname/helloworld
iopcore-node start
```

This will create a directory with configuration files for your node and install the necessary dependencies.

Please note that [IoP Core v6.0.0b3](https://github.com/Internet-of-People/iop-core/releases) will be downloaded automatically. Once completed the iopd binary should be placed into the &lt;iop-data-dir&gt; folder specified during node creation.

For more information about (and developing) services, please see the [Service Documentation](docs/services.md).

## Add-on Services

There are several add-on services available to extend the functionality of Bitcore:

- [Insight API](https://github.com/hendry19901990/insight-api/tree/master)
- [Insight UI](https://github.com/hendry19901990/insight-ui/tree/master)

  
## License

Copyright 2017 IoP Community.

- bitcoin: Copyright (c) 2009-2015 Bitcoin Core Developers (MIT License)
