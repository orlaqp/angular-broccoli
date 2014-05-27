var path = require('path')
var pickFiles = require('broccoli-static-compiler');
var concat = require('broccoli-concat');
var mergeTrees = require('broccoli-merge-trees');
var moveFile = require('broccoli-file-mover');
var uglifyJavaScript = require('broccoli-uglify-js');
var helpers = require('broccoli-kitchen-sink-helpers');

// console.log('multiGlob: %j', helpers.multiGlob(["app/bower_components/**/fonts/*"], { nomount: false }));

var fontFiles = helpers.multiGlob(["app/bower_components/**/fonts/*"], { nomount: false });
var filesToMove = {};
fontFiles.forEach(function(file) {
  filesToMove[file] = path.join('fonts/', path.basename(file));
});
console.log('fonts: %j', filesToMove);

var fontTree = moveFile('.', { files: filesToMove });

// request environment value from BROCCOLI_ENV variable
// you can run the following to compile for production BROCCOLI_ENV=production broccoli build dist
var env = require('broccoli-env').getEnv();
console.log("Running in %s mode", env); // => 'development' or 'production'

// copy view files the same way they are
var viewsTree = pickFiles('app', {
  srcDir: '.',
  files: ['**/*.html'],
  destDir: '.'
});

// copy font files
var fontsTree = moveFile('app', {
  srcDir: '.',
  files: ['**/fonts/*'],
  destDir: 'fonts/'
});


// find main files for bower components
var findBowerTrees = require('broccoli-bower');
var bowerTrees = findBowerTrees();

// console.log(bowerTrees);

// move bower files to the dist directory
var bowerJSFiles = [];
var bowerCSSFiles = [];

// extract all the css and js files from the bower components
bowerTrees.forEach(function(component) {
  var baseDir = component.dir;

  if (component.mainFiles != null) {
    component.mainFiles.forEach(function(mainFile) {
        if (mainFile.match(".js$") == '.js') {
          bowerJSFiles.push(path.join(baseDir.replace('app/', ''), mainFile));
        } else if (mainFile.match(".css$") == '.css') {
          bowerCSSFiles.push(path.join(baseDir.replace('app/', ''), mainFile));
        }
    });
  }
});

// concatenate bower js files into a single file
var thirdPartyJS = concat('app', {
  inputFiles: bowerJSFiles,
  outputFile: '/third_party.js'
});

// concatenate bower css files into a single file
var thirdPartyCSS = concat('app', {
  inputFiles: bowerCSSFiles,
  outputFile: '/third_party.css'
});

// concatenate application js and css files into single files
var jsTree      = concat('app/js', {inputFiles: ['**/*.js'], outputFile:'/app.js'});
var cssTree      = concat('app/css', {inputFiles: ['**/*.css'], outputFile:'/app.css'});

// uglify javascript only when in production
if (env === 'production') {
  jsTree = uglifyJavaScript(jsTree, {
    // mangle: false,
    // compress: false
  });
  thirdPartyJS = uglifyJavaScript(thirdPartyJS, {
    // mangle: false,
    // compress: false
  });
}


module.exports = mergeTrees([jsTree, cssTree, viewsTree, thirdPartyJS, thirdPartyCSS]);
