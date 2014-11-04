var fs = require('fs');

function FS() {

	this.UploadFile = function(UploadFile, callback){
		if (UploadFile.name.length > 0){
			if(UploadFile.type == 'image/jpeg' || UploadFile.type == 'image/jpg' || UploadFile.type == 'image/png'){
				if(UploadFile.size > 0 && UploadFile.size < 2097152){
					var savePath = __dirname + '/public/images/avatars/' + UploadFile.name;
					fs.renameSync(UploadFile.path, savePath);
					return UploadFile.name;
				}else{
					return 'error1';
				}
			}else{
				return 'error2';
			}
		}else{
			return '';
		}
	}
}

global.FS = new FS();