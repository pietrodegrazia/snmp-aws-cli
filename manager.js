const snmp = require ("net-snmp")

const options = {
    port: 8443,
    retries: 1,
    timeout: 5000,
    transport: "udp4",
    trapPort: 8444,
    version: snmp.Version2c,
    idBitsSize: 16
}





class SNMPManager {

    static launchInstance(callback) {
        const varbinds = [{
            oid: "1.3.6.1.4.1.1.1.1.2.0",
            type: snmp.ObjectType.OctetString,
            value: ""
        }]

        _session.set (varbinds, function (error, varbinds) {
            if (error) {
                console.error (error.toString ())
                callback(undefined)
                return 
            }

            if (snmp.isVarbindError(varbinds[0])) {
                console.error(snmp.varbindError(varbinds[0]))
                callback(undefined)
                return
            } else {
                console.log (varbinds[0].oid + "|" + varbinds[0].value)
                callback(String(varbinds[0].value))
            }
        })
    }


    static getCurrentRegion(callback) {
        _session.get (['1.3.6.1.4.1.1.2.2.0'], function (error, varbinds) {
            if (error) {
                console.error ("Error")
                console.error (error)
                callback(undefined)
                return
            }
            
            // console.error ("No error")
            if (snmp.isVarbindError(varbinds[0])) {
                console.error (snmp.varbindError (varbinds[0]))
                callback(undefined)
                return
            } else {
                // console.log (varbinds[0].oid + " = " + varbinds[0].value)
                callback(String(varbinds[0].value))
            }
        })
    }

    static setCurrentRegion(region, callback) {
        const varbinds = [{
            oid: "1.3.6.1.4.1.1.2.2.0",
            type: snmp.ObjectType.OctetString,
            value: region
        }]

        _session.set (varbinds, function (error, varbinds) {
            if (error) {
                console.error (error.toString ())
                callback(undefined)
                return 
            }

            if (snmp.isVarbindError(varbinds[0])) {
                console.error(snmp.varbindError(varbinds[0]))
                callback(undefined)
                return
            } else {
                console.log (varbinds[0].oid + "|" + varbinds[0].value)
                callback(String(varbinds[0].value))
            }
        })
    }

    static getRegions(callback) {
        _getNextRegion('1.3.6.1.4.1.1.2.1', [], callback)
    }

    static getInstances(callback) {
        _getNextInstance('1.3.6.1.4.1.1.1.1', [], callback)
    }
}
module.exports = SNMPManager


const _session = snmp.createSession("127.0.0.1", "public", options)


function _getNextRegion(oid, regions, callback) {
    _session.getNext([oid], function (error, varbinds) {
        if (error) {
            console.error ("Error")
            console.error (error)
            callback(regions)
            return
        }

        if (snmp.isVarbindError(varbinds[0])) {
            console.error ("Error varbind")
            console.error (snmp.varbindError(varbinds[0]))
            callback(regions)
            return
        } else {
            console.log (varbinds[0].oid + " = " + varbinds[0].value)
            //do something with value
            oid = varbinds[0].oid
            let components = oid.split(".")
            let index = components[components.length - 1]
            let column = components[components.length - 2]

            if (!regions[index - 1]) {
                console.log("no region")
                regions.push({})
            }

            console.log("idx: ", index, " cmp: ",column)
            if (column == 1) {
                regions[index - 1].name = String(varbinds[0].value)
                console.log(regions[index - 1])
            } else if (column == 2) {
                regions[index - 1].endpoint = String(varbinds[0].value)
                console.log(regions[index - 1])
            }
            
            _getNextRegion(oid, regions, callback)
        }
    })
}

function belongsToSameSubtree(oidA, oidB) {
    let componentsOidA = oidA.split(".").slice(0, 9).join(".")
    let componentsOidB = oidB.split(".").slice(0, 9).join(".")
    return componentsOidA === componentsOidB
}

function _getNextInstance(oid, instances, callback) {
    _session.getNext([oid], function (error, varbinds) {
        if (error) {
            console.error ("Error")
            console.error (error)
            callback(instances)
            return
        }

        if (snmp.isVarbindError(varbinds[0])) {
            console.error ("Error varbind")
            console.error (snmp.varbindError(varbinds[0]))
            callback(instances)
            return
        } else {
            console.log (varbinds[0].oid + " = " + varbinds[0].value)
            if (! belongsToSameSubtree(oid, varbinds[0].oid) ) {
                console.log("Out of the subtree")
                callback(instances)
                return
            }
            
            oid = varbinds[0].oid
            let components = oid.split(".")
            let index = components[components.length - 1]
            let column = components[components.length - 2]

            if (!instances[index - 1]) {
                console.log("no instance")
                instances.push({})
            }

            console.log("idx: ", index, " cmp: ",column)

            // if (column == 1) {
            let description = instances[index - 1].description || ""
            description = description + " " + String(varbinds[0].value)
            instances[index - 1].description = description
            //     console.log(regions[index - 1])
            // } else if (column == 2) {
            //     regions[index - 1].endpoint = String(varbinds[0].value)
            //     console.log(regions[index - 1])
            // }
            
            _getNextInstance(oid, instances, callback)
        }
    })
}


// session.trap (snmp.TrapType.LinkDown, function (error) {
//     if (error)
//         console.error (error);
// });

