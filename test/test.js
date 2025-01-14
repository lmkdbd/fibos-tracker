"use strict";

const http = require("http");
const Tracker = require("../");
const fs = require("fs");

const cmeos = require("cmeos");

const config = {
	"config_dir": "./blockData/data",
	"data_dir": "./blockData/data",
	"p2p": [
		'127.0.0.1:9801',
		'127.0.0.1:9802',
		'127.0.0.1:9803',
		'127.0.0.1:9804',
		'127.0.0.1:9805'
	],
	"DBconnString": "mysql://root:123456@127.0.0.1/cmeos_mainnet"
};

cmeos.config_dir = config.config_dir;
cmeos.data_dir = config.data_dir;

console.notice("config_dir:", cmeos.config_dir);
console.notice("data_dir:", cmeos.data_dir);


cmeos.load("http", {
	"http-server-address": "0.0.0.0:8888",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});


cmeos.load("net", {
	"p2p-peer-address": config.p2p,
	"max-clients": 100,
	"p2p-listen-endpoint": "0.0.0.0:9999",
	"agent-name": "CMEOS Seed"
});

let chain_config = {
	"contracts-console": true,
	'chain-state-db-size-mb': 8 * 1024,
	"delete-all-blocks": true
};

chain_config['genesis-json'] = "genesis.json";

cmeos.load("producer", {
	'max-transaction-time': 3000
});

cmeos.load("chain", chain_config);
cmeos.load("chain_api");
cmeos.load("emitter");


Tracker.Config.DBconnString = config.DBconnString;
const tracker = new Tracker();
tracker.emitter(cmeos);

cmeos.start();