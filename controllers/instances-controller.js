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

module.exports = router