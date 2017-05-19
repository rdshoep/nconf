/*
 * formats.js: Default formats supported by nconf
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */
var path = require('path')
  , fs = require('fs')
  , env = process.env.NODE_ENV || 'development';

var formats = exports;

//scan current folder's file, setup all format processors.
fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf(".") !== 0) //ignore hidden files and folder
      && (file !== "index.js"); //ignore index file
  })
  .forEach(function (file) {
    var model = require(path.join(__dirname, file));

    if (!checkFormatProcessor(model)) {
      // Babel/ES6 module compatability
      if (model.default
        && typeof model.default === 'object'
        && checkFormatProcessor(model.default)) {
        model = model.default;
      }
      return;
    }

    var modelName = model.name;
    if (!modelName) {
      modelName = file.substring(0, file.indexOf('.'));
    }
    formats[modelName] = model;
  });

//use formats.default cache the default formator
// define a __getter__ method to connect default formats's json node.
// if not, when user set formats.json to a new formator, default format is still be default json formator
var __defaultFormator = undefined;
Object.defineProperty(formats, 'default', {
  set: function(newValue){
    __defaultFormator = newValue;
  },
  get: function(){
    return __defaultFormator || formats.json;
  }
});

/**
 * if imported model contain parse and stringify function, it's a format processor.
 * @param processor
 * @returns {*|urlParse|boolean|exports.json.stringify|module.exports.stringify}
 */
function checkFormatProcessor(processor) {
  return (processor.parse && typeof processor.parse === 'function')
    && (processor.stringify && typeof processor.stringify === 'function');
}

/**
 * detect file formator by filename
 * @param file
 * @returns {undefined}
 */
function detect(file) {
  var fileType;

  if (typeof file === 'object') {
    fileType = path.extname(file.name).substr(1);
  }

  if (typeof file === 'string') {
    fileType = path.extname(file).substr(1);
  }

  var detectedFormator = undefined;
  if (fileType) {
    detectedFormator = formats[fileType];
  }

  return detectedFormator;
}

/**
 * choose a suitable formator
 * @param file
 * @param selectedFormator
 * @returns {*}
 */
function chooseFormator(file, selectedFormator) {
  if (selectedFormator) {
    if (!checkFormatProcessor(selectedFormator)) {
      //file format muse have parse and stringify function
      throw new Error('The file formator muse have parse and stringify function' +
        ', but the file(' + file + ') formator doesn\'t have');
    }

    return selectedFormator;
  }

  var detectedFormator = detect(file);
  if (detectedFormator) {
    return detectedFormator;
  } else {
    if (env !== 'production') {
      console.warn("We can't detect a formator by file('"
        + file
        + "') extname, so use the default formator.");
    }
    return formats.default;
  }
}

//provide chooseFormator function to detect
formats.chooseFormator = chooseFormator;