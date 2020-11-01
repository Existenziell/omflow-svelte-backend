const { Schema, model } = require('mongoose');

const roleSchema = new Schema({
  identifier: { type: String, required: true }
});

const Role = model('Role', roleSchema);

module.exports = Role;
