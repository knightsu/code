var app = require('http').createServer(handler)
	, io = require('socket.io').listen(app)
	, fs = require('fs');
	
app.listen(8000);

function handler (req, res) {
	
	fs.readFile(__dirname + '/client.html',
	function (err, data) {
		if(err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		
		res.writeHead(200);
		res.end(data);
	});
}

var client = {};
var userlist = {};
var min = new Date("October 13, 2100 11:13:00");
var questionlist = ["1+1=", "2+2=", "3+3="];
var anslist = ["2", "4", "6"];
io.sockets.on('connection', function (socket) {
  var cid = socket.id;
  client[socket.id] = socket;
  
  socket.on('login', function(username){
	var data = {time: new Date(), msg: username + ' login successfully at '};
	
	var soc = client[cid];
	if(!userlist[cid])   //if this user haven't attend before
	{
		userlist[cid] = {name: username, score: 0}; // initialize
	}
	soc.emit('login', data);
  });
  
  socket.on('start', function(flag){
    if(flag == 0)
	{
		var data = {question: questionlist[0], quesnum: 1};
	}
	socket.emit('problem', data);
   });
   
   socket.on('next', function(data){
    
	if(data.answer == anslist[data.quesnum - 1])
	{
		var num = parseInt(data.quesnum.valueOf());
		
		var data = {msg: 'last question over focus on this one', question: questionlist[data.quesnum], quesnum: num + 1};
		
		userlist[cid].score += 10;
		if(data.quesnum == questionlist.length)
		{
			socket.emit('finish', data);
		}
		else
		{
			socket.emit('next', data);
		}
	}
	else
	{
		var data = {msg: 'wrong answer try again'};
		socket.emit('wrong', data);
	}
    });
	socket.on('finish', function(data){
		var length = anslist.length;
		
		if(data.answer == anslist[length-1])
		{
			userlist[cid].score += 10;
			var data = {msg: 'you finished and now you can logout and you get ', score: userlist[cid].score};
			var soc = client[cid];
			soc.emit('end', data);
		}
		else
		{
			var data = {msg: 'wrong answer try again'};
			socket.emit('wrong', data);
		}
	});
	
	socket.on('logout', function(username){
		var time = new Date();
		var data = {msg: username + ' logout at ' + time + ' and he got ' + userlist[cid].score};
		
		var soc = client[cid];
		soc.emit('logout', data);
	});
	
	
		
});


		
		
	
  
