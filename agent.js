const snmp = require('snmpjs')
const AWS = require('./aws-helper')

const SNMP_GET_REQUEST = 0
const SNMP_GET_NEXT_REQUEST = 1
const SNMP_SET_REQUEST = 3
const SNMP_OPERATIONS_NAME = ["GetRequest", "GetNext", "GetBulk", "SetRequest"]

var agent = snmp.createAgent({
	name: "AWS-CLI-MIB-AGENT"
});

let currentRegion = "sa-east"

// agent.request({ oid: '.1.3.6.1.4.1.1.2.2', handler: function (req) {
// 	console.log("OID: Current region")
// 	const op = req.op
// 	console.log(SNMP_OPERATIONS_NAME[op])
//
// 	switch(op) {
//
// 	case SNMP_GET_REQUEST:
// 		const val = snmp.data.createData({
// 			type: 'OctetString',
//     		value: currentRegion
//     	})
// 		snmp.provider.readOnlyScalar(req, val)
//
// 	case SNMP_SET_REQUEST:
// 		if (req.value.typename != "OctetString") {
// 			console.log("wrongType")
// 			req.done(snmp.pdu.wrongType)
// 			return
// 		}
//     	currentRegion = String(req.value._value)
//     	AWS.setRegion(currentRegion)
//
//     	const val2 = snmp.data.createData({
// 			type: 'OctetString',
//     		value: currentRegion
//     	})
// 		console.log("Value: " + currentRegion)
// 		snmp.provider.writableScalar(req, val2)
// 	}
// }});


// const regions = [{name: "sa-east-1", endpoint:"www.east.com"},
// 				 {name: "sa-east-2", endpoint:"www.east-2.com"},
// 				 {name: "sa-east-3", endpoint:"www.3.com"}]


class TableDescription {
    constructor(OID, valuesFunc, columns) {
        this._values = valuesFunc()
        this._columns = columns
        this._OID = OID
    }

    getLength() {
	    return this._values.length
    }

    getRootOID() {
	    return this._OID
    }

    getColumnValue(column, row) {
        row--;
        if (!this._columns[column] || !this._values[row] || !this._values[row][this._columns[column].columnName]) return undefined

        return { type: this._columns[column].type, value: this._values[row][this._columns[column].columnName]}
    }

    getColumns() {
        return Object.keys(this._columns)
    }
}

let regions = new TableDescription('1.3.6.1.4.1.1.2.1',
                        function() { return [{name: "sa-east-1", endpoint:"www.east.com"},
                                             {name: "sa-east-2", endpoint:"www.east-2.com"},
                                             {name: "sa-east-3", endpoint:"www.3.com"}]},
                        { 1: { type: 'OctetString', columnName: 'name'},
                          2: { type: 'OctetString', columnName: 'endpoint'}});


addRequestByTableDescription(regions)

function addRequestByTableDescription(tableDescription) {
    agent.request({
        oid: tableDescription.getRootOID(), columns: tableDescription.getColumns(), handler: function (prq) {
            let oid = prq.oid;
            console.log(" ")
            console.log(" ")
            console.log("OID: Regions Table: ", oid)
            // instance *can* be more than one dot component but for our example
            // we'll treat it like a single array index value
            let instance = (prq.instance || [0])[0];
            const column = prq.addr.slice(-2)[0] // last number before instance is column
            let value = tableDescription.getColumnValue(column, instance); // assume this can return null if instance does not exist
            // console.log("Value: ", value)
            // iterate for GetNext requests:
            if (snmp.pdu.GetNextRequest === prq.op) {
                if (!instance) instance = 0; // coerce null or undefined to 0, which wil start @ 1
                do {
                    // if ( ++ instance > 3 ) { // determine when you've exhausted all instances and need to move to the next column...
                    if (++instance > tableDescription.getLength()) { // determine when you've exhausted all instances and need to move to the next column...
                        console.log("prq.done()")
                        prq.done(); // this will signal the agent to search for the next OID
                        return;
                    }
                    value = tableDescription.getColumnValue(column, instance);
                }
                while (!value);
                // console.log("Passou! Value: ", value)
                // correct the oid since we're returning the *next* instance not the one in the request:
                oid = [prq.node.oid, instance].join('.');
            }

            if (!value) { // if a GetRequest asked for an invalid instance
                value = {
                    type: 'Null',
                    value: snmp.data.noSuchInstance
                }
            }
            console.log("oid: ", oid, ", value: ", value)
            const data = snmp.data.createData(value)
            prq.done(snmp.varbind.createVarbind({oid, data}));
        }
    })
}

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
agent.bind({ family: 'udp4', port: 8443 });
console.log("listening");