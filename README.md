# fix-yaml

Fix YAML in Jekyll posts

## Installation

To install from npm, run

`npm install -g fix-yaml`

## Usage

`fix-yaml [options] <list of files with YAML front-matter to fix>`

Options:
  -w, --write-output       Write fixed YAML front-matter back into the input file  [default: false]
  -d, --force-date-update  Force update date field from filename                   [default: false]
  -h, --help               Show help
 

## TODO
 - [x] Support ability to over-write files
 - [ ] Support output file extension
 - [x] Support updating date using file name
 - [x] Autofix description, tags and categories
 - [x] Remove YAML keys except the known ones 
 - [ ] Make tag removal optional (atleast provide override to not strip unknown YAML keywords)
