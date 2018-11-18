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


function getNextRegion(oid) {
    _session.getNext([oid], function (error, varbinds) {
        if (error) {
            console.error ("Error")
            console.error (error)
            // callback(undefined)
            return
        }
    
        if (snmp.isVarbindError(varbinds[0])) {
            console.error ("Error varbind")
            console.error (snmp.varbindError(varbinds[0]))
            // callback(undefined)
            return
        } else {
            console.log (varbinds[0].oid + " = " + varbinds[0].value)
            getNextRegion(varbinds[0].oid)
            // callback(String(varbinds[0].value))
        }
})
}
getNextRegion('1.3.6.1.4.1.1.2.1')

// _session.getNext(['1.3.6.1.4.1.1.2.1.1.2'], function (error, varbinds) {
//         if (error) {
//             console.error ("Error")
//             console.error (error)
//             // callback(undefined)
//             return
//         }
    
//         if (snmp.isVarbindError(varbinds[0])) {
//             console.error ("No error")
//             console.error (snmp.varbindError(varbinds[0]))
//             // callback(undefined)
//             return
//         } else {
//             console.log (varbinds[0].oid + " = " + varbinds[0].value)
//             getNextRegion(varbinds[0].oid)
//             // callback(String(varbinds[0].value))
//         }
// })


// session.trap (snmp.TrapType.LinkDown, function (error) {
//     if (error)
//         console.error (error);
// });