var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, colorize: true, timestamp: true, level:"warning" })
    //,new winston.transports.File({ filename: __dirname + '/debug.log', json: false })
  ] /*,
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, colorize: true, timestamp: true })
    //,new winston.transports.File({ filename: __dirname + '/exceptions.log', json: false })
  ] */
  ,exitOnError: false
});

winston.addColors({
  debug: 'blue',
  info: 'magenta',
  notice: 'cyan',
  warning: 'yellow',
  error: 'red',
  crit: 'red',
  alert: 'green',
  emerg: 'red'
});
logger.setLevels(winston.config.syslog.levels);

module.exports = logger;
/*
process.on('uncaughtException', function(err) {
    for(var key in err)
        if(key == 'stack')
            console.log('stack' + err[key].join('\n'));
        else
            console.log(key + '=' + err[key]);

    console.log(err);
});
*/