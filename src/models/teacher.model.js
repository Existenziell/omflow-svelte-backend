const { Schema, model } = require('mongoose');

const teacherSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true, default: '' },
  quote: { type: String, trim: true, default: '' },
  instagram: { type: String, trim: true, default: '' },
  pose: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  coordinates: { type: Array, required: true },
  image: { type: String, default: '' },
  video: { type: String, default: '' },
  tag: { type: String, unique: true },
  styles: [{ type: Schema.Types.ObjectId, ref: 'Style' }],
  levels: [{ type: Schema.Types.ObjectId, ref: 'Level' }],
  practices: [{ type: Schema.Types.ObjectId, ref: 'Practice' }],
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
});

const Teacher = model('Teacher', teacherSchema);

module.exports = Teacher;
