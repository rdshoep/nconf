//
// ### @json
// Standard JSON format which pretty prints `.stringify()`.
//
module.exports = {
  stringify: function (obj, replacer, spacing) {
    return JSON.stringify(obj, replacer || null, spacing || 2)
  },
  parse: JSON.parse
};