const gaccount = require('./google-serviceaccount');

gaccount.auth(function(err, access_token){
	console.log('token:'+access_token);
});
