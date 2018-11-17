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
    var instanceParams = {
        ImageId: imageId || 'ami-0160a8b6087883cb6',
        InstanceType: 't1.micro',
        MinCount: 1,
        MaxCount: 1
     }
    
     return ec2.runInstances(instanceParams).promise()
}

// example
// exports.getInstances().then(function(data) {
//     console.log(data.Reservations[0].Instances);
// });
// exports.getRegions().then(function(data) {
//     console.log(data)
// })