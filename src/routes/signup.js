const router = require('express').Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');

const User = require("../models/user.model");
const Token = require("../models/token.model");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_SECRET // naturally, replace both with your real credentials or an application-specific password
  }
});

/**
* POST /signup
**/
router.post("/", async (req, res) => {
  try {
    let { email, password, passwordCheck, name } = req.body;
    // Validate
    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: "Please fill out all mandatory fields." });
    if (password.length < 6)
      return res.status(400).json({ msg: "The password needs to be at least 6 characters long." });
    if (password !== passwordCheck)
      return res.status(400).json({ msg: "Please enter the same password twice for verification." });

    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res.status(400).json({ msg: "An account with this email already exists." });

    if (!name) name = email;
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: passwordHash
    });
    const savedUser = await newUser.save();

    // Create a verification token for this user
    const token = new Token({
      _userId: savedUser._id,
      token: crypto.randomBytes(16).toString('hex')
    });

    const mailOptions = {
      from: 'no-reply@omflow.yoga',
      to: savedUser.email,
      subject: 'Email address verification',
      html: `<h1>Hello ${savedUser.name}</h1>\n\nPlease verify your account by clicking <a href="http://${req.headers.host}/api/signup/confirmation/${token.token}">here</a>`
    };

    // Save the verification token
    token.save(async (err) => {
      if (err) { return res.status(500).send({ msg: err.message }); }

      let info = await transporter.sendMail(mailOptions)
        .then((data) => { return data })
        .catch((error) => { return error });

      if (info.messageId) {
        res.json({ message: 'Success! A verification email has been sent to ' + savedUser.email });
      } else {
        res.json({ message: 'Mail not sent!', info });
      }

    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
* GET /confirmation
**/
router.get('/confirmation/:id', (req, res) => {
  // Find a matching token
  Token.findOne({ token: req.params.id }, function (err, token) {
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

    // If we found a token, find a matching user
    User.findOne({ _id: token._userId }, function (err, user) {
      if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
      if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

      // Verify and save the user
      user.isVerified = true;
      user.save(function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        const msg = `
          <h1>Sucess, your account has been verified :)</h1>
          <p>You are ready to <a href="${process.env.FRONTEND_URL}">log in</a> to Omflow</p>`
        res.status(200).send(msg);
      });
    });
  });
});


/**
* POST /resend
*/
router.post('/resend', (req, res) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  // Check for validation errors
  var errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);

  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
    if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

    // Create a verification token, save it, and send email
    var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

    // Save the token
    token.save(async (err) => {
      if (err) { return res.status(500).send({ msg: err.message }); }

      // Send the email
      var mailOptions = {
        from: 'no-reply@omflow.yoga',
        to: user.email,
        subject: 'Account Verification Token',
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
      };

      let info = await transporter.sendMail(mailOptions)
        .then((data) => { return data })
        .catch((error) => { return error });

      if (info.messageId) {
        res.json({ message: 'A verification email has been sent to ' + savedUser.email });
      } else {
        res.json({ message: 'Mail not sent!' });
      }
    });

  });
});

module.exports = router;
