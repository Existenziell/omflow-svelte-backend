const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  isVerified: { type: Boolean, default: false },
  name: { type: String },
  location: { type: String, default: '' },
  role: { type: Schema.Types.ObjectId, ref: 'Role', default: '5f89edafe489166cf2de61c9' },
  lastLogin: { type: Date }
}, {
  timestamps: true,
});

const User = model('User', userSchema);

module.exports = User;
