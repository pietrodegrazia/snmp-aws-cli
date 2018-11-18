const snmp = require('snmpjs')
const AWS = require('./aws-helper')

const SNMP_GET_REQUEST = 0
const SNMP_GET_NEXT_REQUEST = 1
const SNMP_SET_REQUEST = 3
const SNMP_OPERATIONS_NAME = ["GetRequest", "GetNext", "GetBulk", "SetRequest"]

var agent = snmp.createAgent({
	name: "AWS-CLI-MIB-AGENT"
});

let currentRegion = "sa-east-1"
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
    	AWS.setRegion(currentRegion)

    	const val2 = snmp.data.createData({
			type: 'OctetString',
    		value: currentRegion
    	})
		console.log("Value: " + currentRegion)
		snmp.provider.writableScalar(req, val2)
	default: 
		console.log("GET NEXT NOT SUPORTED")
		req.done(snmp.pdu.noSuchName)
		return
	}
}});


class TableDescription {
    constructor(OID, asyncValuesFunc, columns) {
        this._asyncValuesFunc = asyncValuesFunc
        this._columns = columns
        this._OID = OID
    }

    async getValues() {
    	let values = await this._asyncValuesFunc()
    	return values
    }

    async getLength() {
    	let values = await this._asyncValuesFunc()
	    return values.length
    }

    getRootOID() {
	    return this._OID
    }

    async getColumnValue(column, row) {
    	let values = await this._asyncValuesFunc()
        row--;
        if (!this._columns[column] || !values[row] || !values[row][this._columns[column].columnName]) return undefined

        return { type: this._columns[column].type, value: values[row][this._columns[column].columnName]}
    }

    getColumns() {
        return Object.keys(this._columns)
    }
}

let cachedRegions = undefined
let cachedRegionsTimestamp = new Date()
let regionsTable = new TableDescription('1.3.6.1.4.1.1.2.1.1',
	async function() { 
		let now = new Date()
		let diff = (now.getTime() - cachedRegionsTimestamp.getTime()) / 1000;
		console.log(diff)
		if (cachedRegions != undefined && diff < 10 ) {
			return cachedRegions
		}
		let data = await AWS.getRegions()
		let regions = []
		let results = data.Regions
		let count = results.length
		for (let i = 0; i < count; i += 1) {
			regions.push({
				name: results[i].RegionName,
				endpoint: results[i].Endpoint
			})
		}
		cachedRegions = regions
		cachedRegionsTimestamp = now
		return regions 
	},
	{ 
		1: { type: 'OctetString', columnName: 'name'},
		2: { type: 'OctetString', columnName: 'endpoint'}
	}
)
addRequestByTableDescription(regionsTable)


let cachedInstances = undefined
let cachedInstancesTimestamp = new Date()
let instancesTable = new TableDescription('1.3.6.1.4.1.1.1.1.1',
	async function() { 
		let now = new Date()
		let diff = (now.getTime() - cachedInstancesTimestamp.getTime()) / 1000;
		console.log(diff)
		if (cachedInstances != undefined && diff < 10 ) {
			return cachedInstances
		}
		let data = await AWS.getInstances()
		let instances = []
		let reservations = data.Reservations
		let count = reservations.length
		for ( let i = 0; i < count; i += 1 ) {
			let reservation = reservations[i]
			let instance = reservation.Instances[0]

			if (!instance.StateReason) instance.StateReason = {}

			instances.push({
				reservationId: reservation.ReservationId,
				ownerId: "ownerId",
				state: instance.State.Name,
				publicDnsName: instance.PublicDnsName,
				stateMessage: instance.StateReason.Message,
				stateReasonCode: instance.StateReason.Code,
				stateCode: instance.State.Code,
				stateName: instance.State.Name,
				ebsOptimized: instance.EbsOptimized,
				launchTime: instance.LaunchTime,
				privateIpAddress: instance.PrivateIpAddress,
				vpcId: instance.VpcId,
				cpuCoreCount: instance.CpuOptions.CoreCount,
				cpuThreadsPerCoreCount: instance.CpuOptions.ThreadsPerCore,
				instanceType: instance.InstanceType,
				rootDeviceType: instance.RootDeviceType,
				rootDeviceName: instance.RootDeviceName,
				blockVolumeId: ""
			})
		}
		cachedInstances = instances
		cachedInstancesTimestamp = now
		return instances
	},
	{
		1: { type: 'OctetString', columnName: 'reservationId'},
		2: { type: 'OctetString', columnName: 'ownerId'},
		3: { type: 'OctetString', columnName: 'state'},
		4: { type: 'OctetString', columnName: 'publicDnsName'},
		5: { type: 'OctetString', columnName: 'stateMessage'},
		6: { type: 'OctetString', columnName: 'stateReasonCode'},
		7: { type: 'Integer', columnName: 'stateCode'},
		8: { type: 'OctetString', columnName: 'stateName'},
		9: { type: 'OctetString', columnName: 'ebsOptimized'},
		10: { type: 'OctetString', columnName: 'launchTime'},
		11: { type: 'OctetString', columnName: 'privateIpAddress'},
		12: { type: 'OctetString', columnName: 'vpcId'},
		13: { type: 'OctetString', columnName: 'cpuCoreCount'},
		14: { type: 'OctetString', columnName: 'cpuThreadsPerCoreCount'},
		15: { type: 'OctetString', columnName: 'instanceType'},
		16: { type: 'OctetString', columnName: 'rootDeviceType'},
		17: { type: 'OctetString', columnName: 'rootDeviceName'},
		18: { type: 'OctetString', columnName: 'blockVolumeId'}
	}
)
addRequestByTableDescription(instancesTable)


function addRequestByTableDescription(tableDescription) {
    agent.request({
        oid: tableDescription.getRootOID(), columns: tableDescription.getColumns(), handler: async function (prq) {
        	let length = await tableDescription.getLength()
            let oid = prq.oid;
            console.log("\n\nOID: Regions Table: ", oid, ", op: ", prq.op)
            // let filteredOID = oid.replace(tableDescription.getRootOID(), "")
            // let components = oid.split(".")
            // console.log("\n\nOID filtrado ", oid, " comp: ", components)

            // instance *can* be more than one dot component but for our example
            // we'll treat it like a single array index value
            let instance = (prq.instance || [])[0];
            // let column = components[1]
            let column = (instance == undefined) ? 1 : prq.addr.slice(-2)[0] // last number before instance is column
            let value = await tableDescription.getColumnValue(column, instance); // assume this can return null if instance does not exist
            console.log("Inst: ", instance, ", Column: ", column, ", Value: ", value, ", Addr: ", prq.addr)
            
            // iterate for GetNext requests:
            if (snmp.pdu.GetNextRequest === prq.op) {
                if (!instance) instance = 0; // coerce null or undefined to 0, which wil start @ 1
                do {
                	instance += 1
                	console.log(instance, " > ", length)
                    if (instance > length) { // determine when you've exhausted all instances and need to move to the next column...
                        console.log("prq.done()")
                        prq.done(); // this will signal the agent to search for the next OID
                        return;
                    }
                    column = prq.node.oid[prq.node.oid.length -1]
                    value = await tableDescription.getColumnValue(column, instance);
                    console.log("....Inst: ", instance, ", Column: ", column, ", Value: ", value)
                }
                while (!value);
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

console.log("will listen");
agent.bind({ family: 'udp4', port: 8443 });
console.log("listening");