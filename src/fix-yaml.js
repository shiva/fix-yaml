var argv = require('yargs')
	.alias('s', 'safe')
	.argv;

var message;
if(argv.safe)
	message = 'In safe mode, instead of formatting your hard drive, we save one puppy from the shelter.';
else
	message = 'Formatting hard drive... done.';

console.log(message);
