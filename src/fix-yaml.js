#!/usr/bin/env node
//var bunyan = require('bunyan');
var fs = require('fs');
var path = require('path');
var util = require('util');
var fm = require('front-matter');

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
//    .alias('l', 'log-level').describe('l', 'Enable and set log level').boolean('l').default('l', false)
    .help('h')
    .alias('h', 'help')
    .demand(1)  // at least one file or more
	.argv;

/*
var localLogLevel = bunyan.INFO;
if (argv.logLevel) {
    localLogLevel = bunyan.DEBUG;
}

var log = bunyan.createLogger({
    name: "fix-csv",
    stream: process.stdout,
    level : localLogLevel
});
*/

/* Add endsWith to String in ES5, if it doesn't exist */
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function process(data)
{
    delete data.layout;
    delete data.published;
    delete data.type;
    delete data.status;

    if (data.description === undefined) {
        data.description = data.title;
    }
}
        //
argv._.forEach(function(entry) {
    if (entry.endsWith('README.md')) {
        // skip README.md
        return;
    }

    console.log('\nProcessing : ' + entry);
    try {
        var filename = path.join(entry);
        var contents = fs.readFileSync(filename, 'utf8');

        data = fm(contents);
        process(data.attributes);
        console.log(data);

        //console.log(util.inspect(data, false, 10, true));
    } catch (err) {
        console.log(err.stack || String(err));
    }
})
