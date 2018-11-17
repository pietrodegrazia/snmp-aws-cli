const snmp = require ("net-snmp")

const options = {
    port: 161,
    retries: 1,
    timeout: 5000,
    transport: "udp4",
    trapPort: 162,
    version: snmp.Version2c,
    idBitsSize: 16
}

class SNMPManager {
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
}
module.exports = SNMPManager


const _session = snmp.createSession("127.0.0.1", "public", options)



// session.trap (snmp.TrapType.LinkDown, function (error) {
//     if (error)
//         console.error (error);
// });