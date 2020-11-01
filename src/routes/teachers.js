const router = require('express').Router();
const multer = require("multer");
const auth = require("../middleware/auth");

const Practice = require('../models/practice.model');
const Teacher = require('../models/teacher.model');
const Level = require('../models/level.model');

router.get('/', async (req, res) => {
  Teacher.find()
    .populate({
      path: 'practices',
      populate: { path: 'level', model: 'Level' }
    })
    .populate({
      path: 'practices',
      populate: { path: 'style', model: 'Style' }
    })
    .populate({ path: 'levels', select: 'identifier' })
    .populate({ path: 'styles', select: 'identifier' })
    .then(teachers => res.json(teachers))
    .catch(err => res.status(400).json('Error: ' + err));
});


var storage = multer.diskStorage({
  destination: function (req, file, next) {
    next(null, './public/')
  },
  filename: function (req, file, next) {
    const filename = `${req.body.tag}.${file.mimetype.replace("image/", "")}`;
    next(null, filename)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
    cb(null, true);
  } else {
    cb(null, false);
    return cb(new Error('Allowed only .png, .jpg, .jpeg and .gif'));
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 25,
    fieldSize: 1024 * 1024 * 25
  },
  fileFilter: fileFilter
});

router.post("/create", auth, upload.single('file'), async (req, res, next) => {
  try {
    const { name, description, address, quote, instagram, pose, tag } = req.body;
    const image = req.file.path.replace("public/", "");

    const levels = JSON.parse(req.body.levels);
    const styles = JSON.parse(req.body.styles);
    const coordinates = JSON.parse(req.body.coordinates);

    const newTeacher = await new Teacher({
      name, levels, styles, description, address, quote, instagram, pose, coordinates, tag, image
    });

    console.log(newTeacher);
    newTeacher.save()
      .then(() => res.json(newTeacher))
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/edit/:id', auth, async (req, res) => {
  try {
    Teacher.findById(req.params.id)
      .then(teacher => {

        let { name, description, address, quote, instagram, pose, levels, styles, coordinates } = req.body;
        teacher.name = name;
        teacher.description = description;
        teacher.address = address;
        teacher.quote = quote;
        teacher.instagram = instagram;
        teacher.pose = pose;

        // If these values are set (coming from admin) -> save
        levels !== undefined ? teacher.levels = levels : null
        styles !== undefined ? teacher.styles = styles : null
        coordinates !== undefined ? teacher.coordinates = coordinates : null

        teacher.save()
          .then(() => res.json('Data has been updated successfully!'))
          .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    Teacher.findByIdAndDelete(req.params.id)
      .then(() =>
        Practice.deleteMany({ "teacher": req.params.id })
          .then(() => res.json('Teacher and attached practices deleted.'))
          .catch(err => res.status(400).json('Error: ' + err))
      )
      .catch(err => res.status(400).json('Error: ' + err));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    Teacher.findById(req.params.id)
      .populate('levels')
      .populate('styles')
      .populate({
        path: 'practices',
        populate: { path: 'level', model: 'Level' }
      })
      .populate({
        path: 'practices',
        populate: { path: 'style', model: 'Style' }
      })
      .exec(function (err, teacher) {
        if (err) {
          res.status(400).json(err);
          return;
        }
        res.json(teacher);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/byTagName/:id', async (req, res) => {
  try {
    Teacher.findOne({ tag: req.params.id })
      .populate('levels')
      .populate('styles')
      .populate({
        path: 'practices',
        populate: { path: 'level', model: 'Level' }
      })
      .populate({
        path: 'practices',
        populate: { path: 'style', model: 'Style' }
      })
      .exec(function (err, teacher) {
        if (err) {
          res.status(400).json(err);
          return;
        }
        res.json(teacher);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
