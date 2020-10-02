const config = require('../../external/config'),
    AsteriskManager = require('asterisk-manager'),
    util = require('util');

module.exports = function AMI() {
    const ami = new AsteriskManager(config.ami.port, config.ami.host, config.ami.user, config.ami.password, true);
    return {
        action(args) {
            return util.promisify(ami.action).call(ami, args);
        },
        event(args) {
            return util.promisify(ami.on).call(ami, args);
        },
        close() {
            return util.promisify(ami.action).call(ami, { 'action': 'logoff' });
        }
    };
}
/*
const ami = new AsteriskManager(config.ami.port, config.ami.host, config.ami.user, config.ami.password, true);
ami.on('managerevent', function(evt) {
    console.log(evt);
});*/