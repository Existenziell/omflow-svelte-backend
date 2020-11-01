const router = require('express').Router();
let Practice = require('../models/practice.model');
let Teacher = require('../models/teacher.model');
let Style = require('../models/style.model');
let Level = require('../models/level.model');
const auth = require("../middleware/auth");

router.get('/styles', async (req, res) => {
  try {
    Style.find()
      .then(styles => {
        res.json(styles);
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/levels', async (req, res) => {
  try {
    Level.find()
      .then(levels => {
        res.json(levels);
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    Practice.find()
      .populate({ path: 'teacher', select: 'name' })
      .populate({ path: 'style', select: 'identifier' })
      .populate({ path: 'level', select: 'identifier' })
      .then(practices => {
        res.json(practices);
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', auth, async (req, res) => {
  try {

    const { description, date, teacher, style, level, price } = req.body;
    const duration = Number(req.body.duration);

    const newPractice = new Practice({
      description, duration, date, teacher, style, level, price
    });

    newPractice.save()
      .then(() => {
        // Add corresponding practice id to teacher.practices
        Teacher.findByIdAndUpdate(teacher,
          { $push: { practices: newPractice._id } },
          (err, docs) => { if (err) console.log(err) })
      })
      .then(() => res.json('Practice created!'))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    Practice.findById(req.params.id)
      .populate({ path: 'teacher', select: 'name' })
      .populate({ path: 'style', select: 'identifier' })
      .populate({ path: 'level', select: 'identifier' })
      .then(practice => res.json(practice))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    Practice.findByIdAndDelete(req.params.id)
      .then(() => {
        // Delete corresponding practice id from teacher.practices
        Teacher.updateMany({
          $pull: { practices: req.params.id }
        }).then(() => {
          res.json('Practice deleted.')
        });
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/update/:id', auth, async (req, res) => {
  try {
    Practice.findById(req.params.id)
      .then(practice => {
        const { name, description, duration, date, style, level, price } = req.body;
        practice.description = description;
        practice.duration = Number(duration);
        practice.date = date;
        practice.style = style;
        practice.level = level;
        practice.price = price;

        practice.save()
          .then(() => res.json('Practice updated!'))
          .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
