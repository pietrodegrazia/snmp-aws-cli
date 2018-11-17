var os = require('os');
var snmp = require('snmpjs');

const SNMP_GET_REQUEST = 0
const SNMP_SET_REQUEST = 3
const SNMP_OPERATIONS_NAME = ["GetRequest", "GetNext", "GetBulk", "SetRequest"]

var agent = snmp.createAgent({
	name: "AWS-CLI-MIB-AGENT"
});

let currentRegion = "sa-east"

agent.request({ oid: '.1.3.6.1.4.1.1.2.2', handler: function (req) {
	console.log("OID: Current region")
	const op = req.op
	console.log(SNMP_OPERATIONS_NAME[op])
	
	switch(op) {
	case SNMP_GET_REQUEST:
		const val = snmp.data.createData({
			type: 'OctetString',
    		value: currentRegion
    	})
		snmp.provider.readOnlyScalar(req, val)
	case SNMP_SET_REQUEST:
		if (req.value.typename != "OctetString") {
			console.log("wrongType")
			req.done(snmp.pdu.wrongType)
			return
		}
    	currentRegion = String(req.value._value)
    	const val2 = snmp.data.createData({
			type: 'OctetString',
    		value: currentRegion
    	})
		console.log("Value: " + currentRegion)
		snmp.provider.writableScalar(req, val2)
	}
}});





agent.request({ oid: '.1.3.6.1.4.1.1.2.1', columns: [1,2], handler: function (req) {
	console.log("OID: Regions Table")
	console.log(req.oid)
	const op = req.op
	console.log(SNMP_OPERATIONS_NAME[op])
}});

// agent.request({ oid: '.1.3.6.1.4.1.1.2.1.1', handler: function (req) {
// 	console.log("OID: Regions Table - Entry")
// 	console.log(req.oid)
// 	const op = req.op
// 	console.log(SNMP_OPERATIONS_NAME[op])
// }});

// agent.request({ oid: '.1.3.6.1.4.1.1.2.1.1.1', handler: function (req) {
// 	console.log("OID: Regions Table - Entry - regionName")
// 	console.log(req.oid)
// 	const op = req.op
// 	console.log(SNMP_OPERATIONS_NAME[op])
// }});

// agent.request({ oid: '.1.3.6.1.4.1.1.2.1.1.1.0', handler: function (req) {
// 	console.log("OID: Regions Table - Entry - regionName - 0")
// 	console.log(req.oid)
// 	const op = req.op
// 	console.log(SNMP_OPERATIONS_NAME[op])
// 	const val = snmp.data.createData({
// 			type: 'OctetString',
//     		value: "Region name is....."
//     	})
// 		snmp.provider.readOnlyScalar(req, val)

// }});

// agent.request({ oid: '.1.3.6.1.4.1.1.2.1.1.1.2', handler: function (req) {
// 	console.log("OID: Regions Table - Entry - endpoint")
// 	console.log(req.oid)
// 	const op = req.op
// 	console.log(SNMP_OPERATIONS_NAME[op])
// }});

console.log("will listen");
agent.bind({ family: 'udp4', port: 161 });
console.log("listening");