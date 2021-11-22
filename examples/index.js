// [clean env]

const fs = require("fs");
["", "\-shm", "\-wal"].forEach(function(k) {
	if (fs.exists("./cmeos_chain.db" + k)) fs.unlink("./cmeos_chain.db" + k);
});

let setLogs = (logPath) => {
	if (!fs.exists(logPath)) fs.mkdir(logPath);

	console.add([{
		type: "console",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR, console.WARN, console.NOTICE, console.INFO],
	}, {
		type: "file",
		levels: [console.FATAL, console.ALERT, console.CRIT, console.ERROR],
		path: logPath + "error.log",
		split: "hour",
		count: 128
	}, {
		type: "file",
		levels: [console.WARN],
		path: logPath + "warn.log",
		split: "hour",
		count: 128
	}, {
		type: "file",
		levels: [console.INFO, console.NOTICE],
		path: logPath + "access.log",
		split: "hour",
		count: 128
	}]);
}

setLogs("./logs/");

// [cmeos]
const cmeos = require("cmeos");
cmeos.config_dir = "./data";
cmeos.data_dir = "./data";
cmeos.load("http", {
	"http-server-address": "0.0.0.0:8870",
	"access-control-allow-origin": "*",
	"http-validate-host": false,
	"verbose-http-errors": true
});

cmeos.load("net", {
	"p2p-peer-address": ["127.0.0.1:9801"],
	"p2p-listen-endpoint": "0.0.0.0:9870"
});

cmeos.load("producer");
cmeos.load("chain", {
	"contracts-console": true,
	"delete-all-blocks": true,
	"genesis-json": "genesis.json"
});

cmeos.load("chain_api");

//[cmeos-tracker]
const Tracker = require("../");

// Tracker.Config.replay = true;
// Tracker.Config.replayStatrBn = 0;
Tracker.Config.DBconnString = "mysql://root:123456@127.0.0.1/cmeos_chain";

const tracker = new Tracker();

tracker.use(require("./addons/eosio_token_transfers.js"));
tracker.emitter();

cmeos.start();

// [http server]
const http = require("http");
let httpServer = new http.Server("", 8080, [
	(req) => {
		req.session = {};
	}, {
		'^/ping': (req) => {
			req.response.write("pong");
		},
		'/1.0/app': tracker.app,
		"*": [function(req) {}]
	},
	function(req) {}
]);

httpServer.crossDomain = true;
httpServer.asyncRun();