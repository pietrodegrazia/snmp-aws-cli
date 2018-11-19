const manager = require("../manager")
const express = require("express")
const router = express.Router()

router.get('/', function(req, res) {
	console.log("GET /")
	
	manager.getInstances( function(instances) {
		console.log("Feito!")
		console.log(instances)
		res.render('instances-view', {
			instances: instances
		})
	})
})

router.get('/create', function(req, res) {
	console.log("GET /create")
	
	manager.launchInstance( function(instanceId) {
		console.log("Instancia lançada!")
		console.log(instanceId)
		res.render('instance-created-view', {
			instanceId: instanceId
		})
	})
})

router.get('/delete/:instanceId', function(req, res) {
	console.log("GET /delete")
	
	manager.deleteInstance(req.params.instanceId, function(instanceId) {
		console.log("Instancia deletada!")
		console.log(instanceId)
		res.render('instance-deleted-view', {
			instanceId: instanceId
		})
	})
})

module.exports = router