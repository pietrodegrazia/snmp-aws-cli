const manager = require("../manager")
const express = require("express")
const router = express.Router()


// let regions = []

router.get('/', function(req, res) {
	console.log("GET /")

	manager.getRegions( function(fetchedRegions) {
		manager.getCurrentRegion(function(v) {
			res.render('index-view', {
				currentRegion: {name: v},
				regions: fetchedRegions
			})
		})
	})
})

router.get('/regions/:region', function(req, res) {
	console.log("GET /regions")
	manager.getRegions( function(fetchedRegions) {
		manager.setCurrentRegion(req.params.region, function(v){
			res.render('index-view', {
				currentRegion: {name: v},
				regions: fetchedRegions
			})	
		})
	})
})

module.exports = router