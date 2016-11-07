#!/usr/bin/env node

var readdir = require('readdir-enhanced');
var json2csv = require('json2csv');
var fs = require('fs');
var jsonfile = require('jsonfile')

var projects = {}
var exclusions = []
var legacy = []
var projects_1d = []

var program = require('commander');

program
  .version('0.0.1')
  .option('-i, --input <input_directory>', 'Directory to crawl')
  .option('-o, --output <output_directory>', 'Directory to dump file')
  .option('-l, --legacy', 'include legacy, pre-paprika projects (those starting with only numbers)')
  .option('-f, --format <output_format>', 'Output format (csv / json)')
  .option('-v, --verbose', 'enable console logging')
  .parse(process.argv);

if (!program.input){
	console.log('Error: please provide an input directory with -i [directory]');
} else if(!program.output){
	console.log('Error: please provide an output directory with -o [directory]');
} else if(!program.format){
	console.log('Error: please provide an output format -f [csv|json]');
} else {

	readdir(program.input, {
		deep: 1,
		filter: myFilter
	}, function(err, files) {

		// loop through directory list array - begin tidy
		for (var i = 0, len = files.length; i < len; i++) {
			// remove all unwanted folders
			if ( (files[i].toLowerCase().indexOf('support') >= 0) || (files[i].indexOf('~') >= 0 ) || (files[i].indexOf('.') >= 0 ) ){

				exclusions.push(files[i]);
				//console.log('support found in ' + files[i]);
				// don't need to bother cleaning original file list
				//delete files[i];

			} else {

				// create objects by path
				if (files[i].indexOf('/') == -1){
					// top level dir - init obj
				  	projects[files[i]] = []
				} else {
					// 2nd lvl dir, extend obj
					var path = files[i].split('/');
					// replace hyphens and underscores with spaces
					path[1] = path[1].replace(/[_-]+/g, " ");
					// split string at first space to get project code
					var code = path[1].split(' ');
					// check for 0000 rather than 000
					var number_count = code[0].replace(/[^0-9]/g,"").length;
					if (number_count == 4){
						var newcode = code[0].replace('0', '');
						path[1] = path[1].replace(code[0], newcode);
						code[0] = newcode;
					}
					var letter_count = code[0].replace(/[^A-z]/g,"").length;
					if (number_count == 0){
						exclusions.push(files[i]);
					} else if (letter_count == 0 && !program.legacy) {
						legacy.push(files[i]);
					} else {
						// split original path at project code to get just the name
						var name = path[1].split(code[0]);
						name = name[1].substring(1, name[1].length );
						var tags = [code[0], name, path[1]];
						// store as object
						var project = {
						  	client: path[0],
						  	code: code[0],
						  	name: name,
						  	tags: tags.join(', '),
						  	full_name: path[1]
						}
						projects[path[0]].push(project);
					}
				}

			}

		}

		// do a little reloop to perserve the order but add the client as a top level entry
		for (var k in projects){
		    if (projects.hasOwnProperty(k)) {
				var project = {
				  	client: k,
				  	code: k.replace('-', '').substr(0, 3).toUpperCase(),
				  	name: k,
				  	full_name: k
				}
				projects_1d.push(project);
			    projects_1d = projects_1d.concat(projects[k]);
		    }
		}

		// don't need to bother cleaning original file list
		//files = files.filter(function(n){ return n != undefined });
		if (program.verbose) {
			console.log('--LEGACY--');
			console.log(legacy);

			console.log('--EXCLUSIONS--');
			console.log(exclusions);
		}

//		if (program.verbose) console.log(projects_1d);
		if (program.format == 'csv'){

			var fields = ['client', 'full_name', 'code', 'tags'];
			var output = json2csv({ data: projects_1d, fields: fields });

			fs.writeFile(program.output + '/projects.' + program.format, output, function(err) {
			  if (err) throw err;
			  console.log('file saved at ' + program.output + '/projects.' + program.format);
			});

		} else {
			jsonfile.writeFileSync(program.output + '/projects.' + program.format, projects_1d);
			console.log('file saved at ' + program.output + '/projects.' + program.format);
		}

	});

}



function myFilter(stats) {
	if (stats.isDirectory()){
		return true;
	} else {
		return false;
	}
}


