var fs = require('fs');
var path = require('path');

function processFile(fileLoc) {
  fs.readFile(fileLoc, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }

    var baseName = path.basename(fileLoc);

    if (baseName == 'module.js') {
      return;
    }

    var className = baseName.substr(0, baseName.length-3);

    if (data.indexOf('module.exports = function(kernelP) {') == -1 && data.indexOf('module.exports = '+className+';') == -1) {
      // old version
      var lines = data.split('\n');
      var newData = '';

      var line = 15;
      // first 15 lines is license
      for (var i = 0; i < line; i++) {
        newData += lines[i] + '\n';
      }

      newData += '\nmodule.exports = function(kernelP) {\n  return (function() {';

      console.log(className)
      for (var i = line; i < lines.length; i++) {
        if (lines[i] == 'var gKernelP;') {
          newData += '    var gKernelP = kernelP;\n';
        } else if (lines[i].indexOf('module.exports = functio') >= 0) {
          newData += '    return '+className+';\n  })();\n};';
          break;
        } else {
          //console.log(lines[i])
          if (lines[i].length > 0) {
            newData += '    ';
          }
          newData += lines[i] + '\n';
        }
      }

      fs.writeFile(fileLoc, newData, function(err) {
        if(err) {
          return console.log(err);
        }

        //console.log("The file was saved!");
      });

      //console.log(newData)
    }

  });
}

function processDir(dir) {
  fs.readdir(dir, function(err, files) {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }

    files.forEach(function(file, index) {
      var fileLoc = path.join(dir, file);

      fs.stat(fileLoc, function(error, stat) {
        if (error) {
          console.error("Error stating file.", error);
          return;
        }

        if (stat.isFile()) {
          processFile(fileLoc)
        } else if (stat.isDirectory()) {
          processDir(fileLoc);
        }
      });
    });
  });
}

var dir = '/Users/doronrosenberg/mystuff/ibm/eclairjs/git/eclairjs-node/lib/';
processDir(dir);