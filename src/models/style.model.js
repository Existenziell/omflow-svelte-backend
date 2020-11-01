const { Schema, model } = require('mongoose');

const styleSchema = new Schema({
  identifier: { type: String, required: true }
});

const Style = model('Style', styleSchema);

module.exports = Style;
