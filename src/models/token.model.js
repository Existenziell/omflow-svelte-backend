const { Schema, model } = require('mongoose');

const tokenSchema = new Schema({
  _userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200 }
});

const Token = model('Token', tokenSchema);

module.exports = Token;
