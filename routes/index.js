
module.exports = function(io) {
var express = require('express');
var router = express.Router();
router.io=io;
//var io=app.io;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
var userObj={};
router.post("/login",function(req,res,next){
	var user=[{"id":1,"user":"vipin","pass":"test"},{"id":2,"user":"maneesha","pass":"test"},{"id":3,"user":"alice","pass":"test"}];
	for(i in user){
	if(req.body.user==user[i].user && req.body.pass==user[i].pass)
	{
		req.session.user=req.body.user;
		req.session.uid=user[i].id;
		userObj[i]={"name":req.body.user};
		req.session.save();
		//console.log("Session= "+req.sessionID+"---"+req.session.id);
		console.log("user="+req.session.user);
		
		res.json({"status":true,"user":req.body.user,"id":user[i].id});
	}
	}
	res.json({"status":false});
});

router.get('/logout',function(req,res){

	req.session.destroy(function(err){	
		if(err){
			console.log(err);
		}
		else
		{
		res.redirect('/');
		}
	});

});

//module.exports = function (io) {
  //'use strict';
 io.on('connection', function (socket) {
    console.log("testing..........00");
    socket.on("login", function(userdata) {
      console.log("userdata="+userdata);
        socket.handshake.session.userdata = userdata;
    });
    
  });
  return router;
//};
}
//module.exports = router;
