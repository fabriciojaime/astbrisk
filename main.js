const express = require('express');
const consign = require('consign');
 
var app = express();
app.set('view engine','ejs');
app.set('views','src/views');
app.use(express.static('src/views/public'));

consign()
    .include('src/routes')
    .then('src/models')
    .then('src/controllers')
    .into(app);
 
app.listen(80, function(error){
    if(error){
        console.log('Could not start the server')
    }else{
        console.log('Local server running on port 80');
    }
});