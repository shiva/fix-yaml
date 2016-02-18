#!/usr/bin/env node
//var bunyan = require('bunyan');
var fs = require('fs');
var path = require('path');
var util = require('util');
var fm = require('front-matter');
var yaml = require('js-yaml');

var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .alias('w', 'write-output').describe('w', 'Write fixed YAML front-matter back into the input file').boolean('w').default('w', false)
    .alias('d', 'force-date-update').describe('d', 'Force update date field from filename').boolean('d').default('d', false)
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

var localWriteOutput = (argv.writeOutput === true);
var localForceDate = (argv.forceDateUpdate === true);

/* Add endsWith to String in ES5, if it doesn't exist */
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

Date.prototype.toYMDString = function() {
    return this.getFullYear() +
        '-' + (this.getMonth() + 1).pad() +
        '-' + this.getDate().pad();
};

function writeCleanedPost(filename, data) {
    fd = fs.openSync(filename, 'w');

    // write YAML front-matter
    fs.writeSync(fd, '---\n');
    fs.writeSync(fd, yaml.dump(data.attributes));
    fs.writeSync(fd, '---\n');

    // write body
    fs.writeSync(fd, data.body)

    fs.closeSync(fd)
}

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

    if (f === 'description') {
        return false;
    }

    if (f === 'url') {
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

    if ((data.tags !== undefined) &&
        (data.tags.indexOf(',') > -1)) {
        data.tags = data.tags.split(/[\s,]+/);
    }

    if (data.description === undefined) {
        data.description = data.title;
    }

    if ((localForceDate) || (data.date === undefined)) {
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

        if (typeof data.attributes.tags === 'string') {
            console.log(entry + 'contains tags as a string. Split them using ",".');
        }

        //console.log(yaml.dump(data.attributes));

        if (localWriteOutput) {
            writeCleanedPost(filename, data)
        }

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
