const manager = require("../manager")
const express = require("express")
const router = express.Router()

router.get('/', function(req, res) {
	console.log("GET /")
	
	manager.getInstances( function(instances) {
		res.render('instances-view', {
			instances: instances
		})
	})
})


router.get('/instances', function(req, res) {
	console.log("GET /")

	manager.getInstances( function(instances) {
		res.render('instances-view', {
			instances: instances
		})
	})
})

module.exports = router