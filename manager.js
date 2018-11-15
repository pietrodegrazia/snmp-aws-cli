var snmp = require ("net-snmp");

var options = {
    port: 161,
    retries: 1,
    timeout: 5000,
    transport: "udp4",
    trapPort: 162,
    version: snmp.Version2c,
    idBitsSize: 16
};

var session = snmp.createSession ("127.0.0.1", "public", options);

// var oids = ['1.3.6.1.4.1.1.2.2.0'];

// session.get (oids, function (error, varbinds) {
//     if (error) {
//     	console.error ("Error");
//         console.error (error);
//     } else {
//     	console.error ("No error");
//         for (var i = 0; i < varbinds.length; i++)
//             if (snmp.isVarbindError (varbinds[i]))
//                 console.error (snmp.varbindError (varbinds[i]))
//             else
//                 console.log (varbinds[i].oid + " = " + varbinds[i].value);
//     }

//     // If done, close the session
//     session.close ();
// });

// session.trap (snmp.TrapType.LinkDown, function (error) {
//     if (error)
//         console.error (error);
// });


var varbinds = [
    {
        oid: "1.3.6.1.4.1.1.2.2.0",
        type: snmp.ObjectType.Integer,
        value: 10
    }
];

session.set (varbinds, function (error, varbinds) {
    if (error) {
        console.error (error.toString ());
    } else {
        for (var i = 0; i < varbinds.length; i++) {
            // for version 1 we can assume all OIDs were successful
            console.log (varbinds[i].oid + "|" + varbinds[i].value);
        
            // for version 2c we must check each OID for an error condition
            if (snmp.isVarbindError (varbinds[i]))
                console.error (snmp.varbindError (varbinds[i]));
            else
                console.log (varbinds[i].oid + "|" + varbinds[i].value);
        }
    }
});