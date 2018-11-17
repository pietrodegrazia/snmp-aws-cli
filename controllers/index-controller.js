const manager = require("../manager")
const express = require("express")
const router = express.Router()

router.get('/', function(req, res) {
	console.log("GET /")

	manager.getCurrentRegion(function(v){
		res.render('index-view', {
			currentRegion: {name: v},
			regions: [
				{name: "sa-east-1"},
				{name: "sa-east-2"},
				{name: "sa-east-3"}
			]
		})	
	})
})

router.get('/regions/:region', function(req, res) {
	console.log("GET /regions")

	manager.setCurrentRegion(req.params.region, function(v){
		res.render('index-view', {
			currentRegion: {name: v},
			regions: [
				{name: "sa-east-1"},
				{name: "sa-east-2"},
				{name: "sa-east-3"}
			]
		})	
	})
})

module.exports = router