# Directory to JSON / CSV node.js crawler

A simple node CLI script for crawling directories, formatting / standardising the results and printing the output to a json or csv file.
I made this because we have an archive on our server of all our clients and jobs, neatly organised with project codes etc, which I wanted to import into Timecamp as projects.

The folder structure looks like
```
- Client
--- CLI001 - Project Name
--- CLI002 - Project Name
```
So from this I can process the name and pull out project codes - and at the same time cater for any typos and malformed projects, where hyphens had been used as spacings or one too many 000s had been added to the project codes etc.

Tags are created for each project based on the name of the project, the project code and the two combined.

## Input flags

| Flag | Alt            | Description  |
| -----|----------------| -------------|
| -i   | --input [file] | Directory to crawl |
| -o   | --output [dir]	| Directory to create output file |
| -l   | --legacy 		| Include legacy projects (those starting with only numbers) |
| -f   | --format 		| Output format (csv / json) |
| -v   | --verbose 		| Enable console logging |

## Setup

`cd` to the repo and run `npm install`

#### Output format

```
[{
	"client": "Client Name",
	"name": "Client Name",
	"tags": "",
	"full_name": "Client Name"
},{
	"client": "Client Name",
	"name": "INDIVIDUAL PROJECT NAME",
	"tags": "PROJECT CODE, PROJECT NAME, PROJECT CODE - PROJECT NAME",
	"full_name": "PROJECT CODE - PROJECT NAME"
}]
```

I also created a sister script to handle the import process for the Timecamp API [available here](https://github.com/gravyraveydavey/timecamp-node-tasks-api)