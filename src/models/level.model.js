const { Schema, model } = require('mongoose');

const levelSchema = new Schema({
  identifier: { type: String, required: true }
});

const Level = model('Level', levelSchema);

module.exports = Level;
