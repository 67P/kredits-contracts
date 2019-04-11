const tv4 = require('tv4');
const validator = tv4.freshApi();

validator.addFormat({
  'date': function(value) {
    const dateRegexp = /^[0-9]{4,}-[0-9]{2}-[0-9]{2}$/;
    return dateRegexp.test(value) ? null : "A valid ISO 8601 full-date string is expected";
  },
  'time': function(value) {
    const timeRegexp = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([\+|\-]([01][0-9]|2[0-3]):[0-5][0-9]))$/;
    return timeRegexp.test(value) ? null : "A valid ISO 8601 full-time string is expected";
  }
})

module.exports = validator;
