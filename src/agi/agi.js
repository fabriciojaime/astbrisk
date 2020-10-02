var AGIServer = require('ding-dong');
 
var handler = function (context) {
    context.onEvent('variables')
        .then(function (vars) {
            return context.getFullVariable('${MEMBERINTERFACE}')
        }).then(function (vars) {
            return context.getFullVariable('${MEMBERNAME}')
        }).then(function (vars) {
            return context.getFullVariable('${MEMBERCALLS}')
        }).then(function (vars) {
            return context.getFullVariable('${MEMBERLASTCALL}')
        }).then(function (vars) {
            return context.getFullVariable('${MEMBERPENALTY}')
        }).then(function (vars) {
            return context.getFullVariable('${MEMBERDYNAMIC}')
        }).then(function (vars) {
            return context.getFullVariable('${MEMBERREALTIME}')
        })
        
        .then(function (vars) {
            return context.getFullVariable('${QEHOLDTIME}')
        }).then(function (vars) {
            return context.getFullVariable('${QEORIGINALPOS}')
        })
        
        .then(function (vars) {
            return context.getFullVariable('${QUEUENAME}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUEMAX}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUESTRATEGY}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUECALLS}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUEHOLDTIME}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUECOMPLETED}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUEABANDONED}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUESRVLEVEL}')
        }).then(function (vars) {
            return context.getFullVariable('${QUEUESRVLEVELPERF}')
        }).then(function (result) {       
            return context.end();
        });
}; 
var agi = new AGIServer(handler);
agi.start(3000);