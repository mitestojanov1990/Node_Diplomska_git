var mysql = require('mysql');

function DAL() {

    this.connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'db_intranet',
        multipleStatements: true
    });

    this.initialize = function () {
        this.connection.connect();
    }


    this.CheckLogin = function(username, password, callback){
		query = "SELECT * FROM Users WHERE Username='" + username + "' AND Password='" + password + "'";
		this.connection.query(query, function(err, docs) {
			if (err) callback('error2');
			numRows = docs.length;
			if(numRows > 0){
				callback(docs[0].ID);
			}else{
				callback('error3');
			}
		});
    }

    this.RegisterUser = function(name, surname, username, email, password, callback){
		this.connection.query('INSERT INTO Users (Name, Surname, Username, Email, Password, Avatar, Date, UserType) VALUES (?, ?, ?, ?, ?, "/avatars/default-avatar.png", NOW(), 1);' , [name, surname, username, email, password], function(err, docs) {
			if (err) callback('error');
			callback('login');
		});
    }

    this.GetAllUsers = function(callback){
    	this.connection.query('select * from Users', function(err, users){
    		if(err){}
    		callback(users);
    	});
    }
    
    this.GetAllMessages = function (callback) {
        this.connection.query('select * from messages', function (err, messages) {
            if (err) { }
            callback(messages);
        });
    }
    
    this.CreateMessage = function (cur_user_id, user_id, message, callback) {
        var query = 'call create_new_message(' + cur_user_id + ', ' + user_id + ', "' + message + '")';
        this.connection.query(query, function (err, res) {
            if (err) { }
            callback(res);
        });
    }

    this.EditUserProfile = function(userID, callback){
        this.connection.query('select * from Users where ID = ' + userID, function(err, user){
            if(err) {}
            callback(user[0]);
        });
    }

    this.EditUserInfo = function(userID, editName, editSurname, editUsername, editAvatar, editPassword, editPassword2, callback){
        var queryString = global.DAL.PrepareQuery(userID, editName, editSurname, editUsername, editAvatar, editPassword, editPassword2);
        if(queryString == 'error'){
            callback = 'error3';
        }else{
            var query = "UPDATE Users SET " + queryString + " WHERE ID = " + userID;
            global.DAL.connection.query(query, function(err, updated){
                if(err) { callback = 'error4'; }
            });
            callback = 'success';
        }
    }
    this.PrepareQuery = function(userID, editName, editSurname, editUsername, editAvatar, editPassword, editPassword2){
        var queryString = '';
        var checkPass = true;
        if(editName.length > 0){
            queryString += "Name = '" + editName + "'";
        }
        if(editSurname.length > 0){
            if(queryString.length == 0)
                queryString += "Surname = '" + editSurname + "'";
            else
                queryString += ", Surname = '" + editSurname + "'";
        }
        if(editUsername.length > 0){
            if(queryString.length == 0)
                queryString += "Username = '" + editUsername + "'";
            else
                queryString += ", Username = '" + editUsername + "'";
        }
        if(editAvatar.length > 0){
            if(queryString.length == 0)
                queryString += "Avatar = '/images/avatars/" + editAvatar + "'";
            else
                queryString += ", Avatar = '/images/avatars/" + editAvatar + "'";
        }
        if(editPassword.length > 0 && editPassword2.length > 0){
            if(editPassword = editPassword2){
                checkPass = true;
                if(queryString.length == 0)
                    queryString += "Password = '" + editPassword + "'";
                else
                    queryString += ", Password = '" + editPassword + "'";
            }else{
                checkPass = false;
            }
        }
        if(checkPass == true){
            return queryString;
        }else{
            return 'error';
        }
    }
}


global.DAL = new DAL();