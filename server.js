const express = require('express');
const consign = require('consign');


var app = express();
app.set('view engine','ejs');
app.set('views','src/views');
app.use(express.static('public'));

var bp = require('body-parser');
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

consign()
    .include('src/routes')
    .into(app);

app.listen(80, function(error){
    if(error){
        console.log('Could not start the server')
    }else{
        console.log('Local server running on port 80');
    }
});