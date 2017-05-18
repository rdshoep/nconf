//
// ### @json
// Standard JSON format which pretty prints `.stringify()`.
//
var JSON5 = require('json5');
module.exports = {
  stringify: function (obj, replacer, spacing) {
    return JSON5.stringify(obj, replacer || null, spacing || 2)
  },
  parse: JSON5.parse
};