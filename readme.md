# Chillter

## Technology stack [which you should know]
* Cordova
* Ionic 2
* Angular 2
* TypeScript
* Node.js and npm
* SASS
* PouchDB

## Technology stack [which you should have installed]
* Docker

## Quick start with Docker
I won't provide instructions how to install Docker on a local machine,
because it might change over time. For instructions please visit official
[page][docker]. To validate your Docker installation, you should be able 
to run `docker -v` command in the terminal.

Project comes with Makefile shortcuts to all most common commands.
All commands list, and what they do is provided beneath. To quick start the
project please first run `make start` - it will download all npm dependencies
and then start the project. **Docker image weights ~3GB so it can take some 
time to download.** When that step is completed you should be access to webpage
version of the app at [http://localhost:8100/][localhost] in your web browser.

## Usage examples
### Start project
Run `make start` in project's root directory.

### Add npm dependency
1. Enter running container with command `make enter`
2. Enter dependency you need, for instance: `npm install dragula --save`
3. To exit containter press `Ctrl + P` and then `Ctrl + Q`

### Add cordova dependency
Use `make ionic` command with `cmd` argument where you place the rest of command
surrounded in double quotes, for instance: 
`make ionic cmd="plugin add --save cordova-plugin-camera"`

### Can't resolve dependency (or any other) problem
Try to `make reset`. Command will basically clean up your project. Sometimes 
it helps in odd situations.

## Hints
* you can debug your app just like a usual webpage via Chrome inspect tools, in order to do 
so, please open [Chrome inspect][chrome-inspect] in Chrome or Chromium browser

## Know issues
* use Chrome/ Chromium, Firefox does not support PouchDB's `websql` adapter
* if app can't be installed via `make run` command, try to delete app from the phone first

## Makefile shortcuts 
* `make start` - starts project
* `make npm` - download all npm dependencies
* `make enter` - enter running container
* `make upload` - upload app into [Ionic View][ionic-view]
* `make run` - run app on connected phone or virtual device
* `make add` - enable to build and run android builds
* `make reset` - deletes project generated files and dependencies, then restarts containter
* `make ionic cmd=foo` - runs Ionic `foo` command
* `make delete` - deletes container
* `make purge` - delete container and image

[docker]:https://www.docker.com/
[localhost]:http://localhost:8100/
[ionic-view]:http://view.ionic.io/
[chrome-inspect]:chrome://inspect