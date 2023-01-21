var pinoms = require('pino-multi-stream')
const pretty = require('pino-pretty');
const path = require('path');
const fs = require('fs');

const stream = pretty({
    colorize: true, // colorizes the log
    levelFirst: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,req,res,hostname,reqId',
});

var streams = [
    { stream: fs.createWriteStream(`${path.dirname(require.main.filename)}/logger.log`) },
    { stream: stream }
]

module.exports = pinoms(pinoms.multistream(streams))