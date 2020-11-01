const { Schema, model } = require('mongoose');

const practiceSchema = new Schema({
  style: { type: Schema.Types.ObjectId, ref: 'Style', required: true },
  level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  date: { type: Number, required: true },
  price: { type: Number, required: true, min: 0, max: 1000 },
  recurring: { type: Boolean, default: true }
}, {
  timestamps: true,
});

function getPrice(num) {
  return (num / 100).toFixed(2);
}

function setPrice(num) {
  return num * 100;
}

const Practice = model('Practice', practiceSchema);

module.exports = Practice;
