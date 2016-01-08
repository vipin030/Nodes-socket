var express = require('express');
var router = express.Router();
router.get("/",function(req,res,next){
	//console.log("Session in home= "+req.sessionID+"---"+req.session.id);
	res.render('home',{title:'My Chat System'});
});
module.exports = router;