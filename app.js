var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var connect = require('connect');
var cookie = require("cookie");
var q = require("q");

var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var home = require('./routes/home');
// var http = require('http');
var io    = require('socket.io');
var app = express();
var io = io.listen(app.listen(3000));
var userObj={};
//var io           = io();
app.io           = io;

// //var express = require('express'),
// var express = require('express'),
//     io = require('socket.io'),
//     http = require('http'),
//     app = express(),
//     server = http.createServer(app);
//     server.listen(3000);
//     var io = io.listen(server);
//     app.io=io;
 

    
    //var http = require('http');
   // var app = express();

    //var io = require('socket.io')();
   // app.io=io;
    //var routes = require('./routes/index')(io);
    //var server = http.createServer(app);
    //app.io.listen(server);
 
//server.listen(3000);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var sessionStore = new session.MemoryStore();

//var SessionStore = require('session-file-store')(session);
//var session_store=session({ secret: 'snowmen-secret', resave: true, saveUninitialized: true});
    // session = Session({
    //   store: new SessionStore({ path: './tmp/sessions' }),
    //   secret: 'pass',
    //   resave: true,
    //   saveUninitialized: true
    // });
var sharedsession = require("express-socket.io-session");
//app.use(session_store);
 //app.use(cookieParser);
 var session_store=session({
  name : "connect.sid",
  secret : "snowmen",
  cookie : {
    httpOnly : true
  },
  saveUninitialized : true,
  resave : true,
  store : sessionStore
});
 app.use(session_store);

 io.use(sharedsession(session_store));

// io.use(function(socket, next) {
//   session(socket.handshake, {}, next);
// });
app.use(express.static(path.join(__dirname, 'public')));

//io.use(function(socket, next) {
//  session_store(socket.request, socket.request.res, next);
//});



app.use('/', routes(io));
app.use('/users', users);
app.use('/home',home);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

function getSession(socket) {
  var defer = q.defer();
  var signedCookies,
    parsedCookies = cookie.parse(socket.handshake.headers.cookie);

  signedCookies = cookieParser.signedCookies(parsedCookies, "snowmen");
  signedCookies = cookieParser.JSONCookies(signedCookies);
  sessionStore.get(signedCookies["connect.sid"], function(err, sess) {
    if (err || !sess) {
      defer.reject(err);
      return;
    }
    defer.resolve(sess);
  });
  return defer.promise;
}

//module.exports = function (io) {
  //'use strict';
 io.on('connection', function (socket) {
  console.log("session="+socket.request.sessionID);
    console.log(socket.id+"00"+socket.handshake.headers.cookie);
    socket.on("login", function(userdata) {
      console.log(userdata);
        socket.handshake.session.userdata = userdata;
        userObj[userdata.uid]={"name":userdata.user,"sockets":[]};
        userObj[userdata.uid]['sockets'].push(socket.id);
        console.log(userObj);
        socket.emit("authstatus",{status:"Y"});
    });
    socket.on("chatlist",function(data){
      var userlist=[];
      for(i in userObj)
      {
        userlist.push({"name":userObj[i].name});
      } console.log(userlist);
      io.sockets.emit("clist",userlist);
    });
    socket.on("message_to_server",function(data){
      console.log(userObj);
        for(i in userObj)
        {
          if(userObj[i].name==data.user)
          {
            console.log("running");
            for(j in userObj[i].sockets)
              //io.sockets.emit("message_to_client",{"message":data.message});
              console.log("sid="+userObj[i].sockets[j]);
              
              var sid=userObj[i].sockets[j];
              //sid.emit('message_to_client',{"message":data.message});
              console.log("socket=");
              console.log(socket.id);
              //io.sockets.connected[sid].emit('message_to_client',{"message":data.message});
              socket.emit("message_to_client",{"message":data.message,"from":''});
              io.to(sid).emit("message_to_client",{"message":data.message,"from":data.from,"to":data.user});
              //io.sockets.emit("message_to_client",{"message":data.message});
          }
        }
    });
    socket.on("disconnect",function(data)
    {
      for(i in userObj)
      {
        for(j in userObj[i].sockets)
        {
          if(userObj[i].sockets[j]==socket.id)
          {
            console.log("socket removed:"+socket.id);
            userObj[i].sockets.splice((j-1),1);
            console.log(userObj);break;
          }
        }
      }
    });
    if(typeof socket.handshake.headers.cookie!="undefined"){
      console.log('match');
      getSession(socket).then(function(value){console.log("test");console.log(value);}).fail(function (err) {
    console.log("error"+err);
});
    }

   // getSession(socket).then(function(value){console.log(value);});
    //console.log(session);
    //userObj[req.session.uid]={"name":req.session.user};
    //userObj[req.session.uid]['socket'].push(socket.id);
    //console.dir(socket.request.session);
    //console.log(socket.handshake.session);
    // socket.on('message_to_server', function(data) { 
    //   console.log(socket.id+"01");
    //   //var escaped_message = sanitize(data["message"]).escape();
    //   io.sockets.emit("message_to_client",{ message: data["message"] }); 
    // });
    // socket.on('disconnect', function() {
    //     console.log('Got disconnect!'+socket.id);

    // });
          
    
  });
//};
module.exports = app;
