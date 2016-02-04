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

Date.prototype.toYMDString = function() {
    return this.getFullYear() +
        '-' + (this.getMonth() + 1) +
        '-' + this.getDate();
};

function getDateFromFileName(fullpath) {
    var filename = path.parse(fullpath).name;
    var dateParts = filename.split("-");

    return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
}

function shouldDelete(data, f) {
    if (f === 'tags') {
        return ((data.tags === null) || (data.tags === '\\[\\]'));
    }

    if (f === 'categories') {
        return ((data.categories.length == 0) || (data.categories === '\\[\\]'));
    }

    if (f === 'title') {
        return false;
    }

    if (f === 'date') {
        return false;
    }

    return true;
}

function process(data, filename) {
    for(var f in data) {
        if (shouldDelete(data, f)) {
            delete data[f];
        }
    }

    if (data.description === undefined) {
        data.description = data.title;
    }

    if (data.date === undefined) {
        date = getDateFromFileName(filename);
        data.date = date.toYMDString();
    }
}

var filesToFix = [];

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
        process(data.attributes, entry);
        console.log(data);

        //console.log(util.inspect(data, false, 10, true));
    } catch (err) {
        console.log(err.stack || String(err));
        filesToFix.push(entry);
    }
});

if (filesToFix.length > 0) {
    console.log("\n Need to fix: ");
    filesToFix.forEach(function(entry) {
        console.log(entry);
    });
}
