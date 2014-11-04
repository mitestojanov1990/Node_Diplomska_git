dalfile = require('./DAL.js');
fsfile = require('./FS.js');

var express = require('express')
	http = require('http')
	url = require('url')
	mysql = require('mysql')
	path = require('path')
	swig = require('swig');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.engine('html',swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

swig.setDefaults({ cache: false });


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// COOKIE CHECK
function checkCookie(req, res, next){
	if(req.cookies.userID){
		next();
	}else{
		res.redirect('/login');
	}
}


// APP GET
app.get('/', function(req, res){
	if(req.cookies.userID){
		var notif="";
		if(req.param('logged') == 1){
			notif = 'You are logged in.';
			res.render('home', {notif: notif});
		}else{
			res.render('home');
		}
	}else{
		res.render('index');
	}
});

app.get('/editprofile', checkCookie, function(req, res){
	var userID = req.cookies.userID;
	if(req.param('error') == 1){
		global.DAL.EditUserProfile(userID, function(userInfo){
			res.render('editProfile', { notif: 'File too big.', userInfo: userInfo });
		});
	}else if (req.param('error') == 2){
		global.DAL.EditUserProfile(userID, function(userInfo){
			res.render('editProfile', { notif: 'File type not supported.', userInfo: userInfo });
		});
	}else if (req.param('error') == 3){
		global.DAL.EditUserProfile(userID, function(userInfo){
			res.render('editProfile', { notif: 'Password missmatch.', userInfo: userInfo });
		});
	}else if (req.param('error') == 4){
		global.DAL.EditUserProfile(userID, function(userInfo){
			res.render('editProfile', { notif: 'Query error.', userInfo: userInfo });
		});
	}else{
		global.DAL.EditUserProfile(userID, function(userInfo){
			res.render('editProfile', { userInfo: userInfo });
		});
	}
});

app.get('/login', function(req, res){
	var notif ="";
	if(req.param('error') == 1){
		notif = 'All fields are required.';
		res.render("login", {notif: notif});
	}else if(req.param('error') == 2){
		notif = 'Query error.';
		res.render("login", {notif: notif});
	}else if(req.param('error') == 3){
		notif = 'User/Password missmatch.';
		res.render("login", {notif: notif});
	}else{
		if(req.cookies.userID){
			res.redirect('/lobby');
		}
		else{
			res.render('login');
		}
	}
});

//register
app.get("/register", function (req, res) {
	var notif ="";
	if(req.cookies.userID){
		res.redirect('/?logged=1');
	}else{
		if(req.param('error') == 1){
			notif = 'All fields are required.';
			res.render("register", {notif: notif});
		}
		else if(req.param('error') == 2){
			notif = 'Password missmatch.';
			res.render("register", {notif: notif});
		}else{
			var notif ="";
			res.render("register");
		}
	}
});

app.get("/messages", function (req, res) {
    global.DAL.GetAllMessages(function (messages) {
        res.render('messages', { messages: messages });
    });
});

app.get("/messages/new", function (req, res) {
    global.DAL.GetAllUsers(function (users) {
        res.render('messages_new', { users: users });
    });
});

app.get('/logout', function(req,res){
    res.clearCookie('userID');
	res.redirect('/login');
});

app.get('/users', checkCookie, function(req, res){
	global.DAL.GetAllUsers(function(users){
		res.render('users', {users: users});
	});
});


// APP POST
app.post("/messages/new:id", function(req, res) {
    var id = req.params.id;

});

app.post('/', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	if(username.length == 0 || password.length == 0){
		res.redirect('/login/?error=1');
	}else{
		global.DAL.CheckLogin(username, password, function(tmp){
			if(tmp == 'error2'){
				res.redirect('/login/?error=2');
			}else if(tmp == 'error3'){
				res.redirect('/login/?error=3');
			}else{
                res.cookie('userID', tmp, { maxAge: 900000, httpOnly: true });
				res.redirect('/');
			}
		});
	}
});

//post od register 
app.post("/login", function (req, res) {
	var name = req.body.name;
	var surname = req.body.surname;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	if(name.length == 0 || surname.length == 0 || username.length == 0 || email.length == 0 || password.length == 0 || password2.length == 0){
		res.redirect('/register/?error=1')
	}else{
		if (password == password2){
			global.DAL.RegisterUser(name, surname, username, email, password, function(tmp){
				if(tmp == 'error'){
					res.redirect('/register');
				}else{
					res.redirect('/login');
				}
			});
		}else{
			res.redirect('/register/?error=2')
		}
	}
});

app.post('/editprofile', function(req, res){
	var userID = req.body.userID;
	var editName = req.body.editName;
	var editSurname = req.body.editSurname;
	var editUsername = req.body.editUsername;
	var editAvatar = req.files.editAvatar;
	var editPassword = req.body.editPassword;
	var editPassword2 = req.body.editPassword2;
	var fileData = global.FS.UploadFile(editAvatar);
	if(fileData == 'error1'){
		res.redirect('/editprofile?error=1');
	}else if(fileData == 'error2'){
		res.redirect('/editprofile?error=2');
	}else{
		editAvatar = fileData;
		global.DAL.EditUserInfo(userID, editName, editSurname, editUsername, editAvatar, editPassword, editPassword2, function(updatedInfo){
			if(updatedInfo == 'error3'){
				res.redirect('/editprofile?error=3'); // password missmatch
			}else if (updatedInfo == 'error4'){
				res.redirect('/editprofile?error=4'); //query error
			}else{
				res.redirect('/editprofile'); // updated info
			}
			
		});
	}
});

global.server = http.createServer(app).listen(app.get('port'), function(){
	
	console.log('Express server listening on port ' + app.get('port'));
});

socketHelperfile = require('./sockets.js');


global.DAL.initialize();


