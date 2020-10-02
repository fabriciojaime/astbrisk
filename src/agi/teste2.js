#!/usr/bin/node

console.log('EXEC','NoOp','INICIO_DO_SCRIPT!');
console.log('ANSWER');

//console.log('EXEC','NoOp','DECLARANDO_VARIAVEL');
//console.log('set', 'variable','agi_type','PJSIP');
//console.log('EXEC','NoOp','CAPTURANDO_VARIAVEL');
//console.log('get', 'variable','agi_type');

//CALLERID
var CALLERID = ('GET FULL VARIABLE ${CALLERID(NUM)}');

//TECHNOLOGY EXTEN
var texEXTEN = ('GET FULL VARIABLE ${CHANNEL(channeltype)}');
console.log(texEXTEN);

//console.log('EXEC','Dial', `PJSIP/${EXTEN}`);

console.log('HANGUP');