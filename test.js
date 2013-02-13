const gaccount = require('./google-oauth-serviceaccount');

gaccount.auth(function(err, access_token){
    if(err)throw err;

	console.log('token:'+access_token);
});
