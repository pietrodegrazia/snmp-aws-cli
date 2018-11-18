const AWS = require('aws-sdk')
AWS.config.update({region: 'sa-east-1'})
let ec2 = new AWS.EC2()

exports.getInstances = function () {
    return ec2.describeInstances({}).promise()
}

exports.getRegions = function () {
    return ec2.describeRegions({}).promise()
}

exports.setRegion = function(region) {
	AWS.config.update({region: region})
	ec2 = new AWS.EC2()
}

exports.createInstance = function(imageId) {

    let imageIdByRegion = {
        'us-east-1': 'ami-013be31976ca2c322',
        'us-east-2': 'ami-0b59bfac6be064b78',
        'us-west-1': 'ami-01beb64058d271bc4',
        'us-west-2': 'ami-061e7ebbc234015fe',
        'ap-south-1': 'ami-0912f71e06545ad88',
        'ap-northeast-2': 'ami-0a10b2721688ce9d2',
        'ap-southeast-1': 'ami-085fd1bd447be68e8',
        'ap-southeast-2': 'ami-0b8dea0e70b969adc',
        'ap-northeast-1': 'ami-00f9d04b3b3092052',
        'ca-central-1': 'ami-05cac140c6a1fb960',
        'eu-central-1': 'ami-02ea8f348fa28c108',
        'eu-west-1': 'ami-0a5e707736615003c',
        'eu-west-2': 'ami-017b0e29fac27906b',
        'eu-west-3': 'ami-04992646d54c69ef4',
        'sa-east-1': 'ami-0160a8b6087883cb6'
    }

    var instanceParams = {
        ImageId: imageId || imageIdByRegion[AWS.config.region],
        InstanceType: 't1.micro',
        MinCount: 1,
        MaxCount: 1
     }
    
     return ec2.runInstances(instanceParams).promise()
}

exports.terminateInstance = function(instanceId) {
    var params  = {
        InstanceIds: [instanceId]
    }

    return ec2.terminateInstances(params).promise()
}

// example
// exports.getInstances().then(function(data) {
//     console.log(data.Reservations[0].Instances);
// });
// exports.getRegions().then(function(data) {
//     console.log(data)
// })