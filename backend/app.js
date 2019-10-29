const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');
const randomString = require("randomstring");
const Cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Link = require('./models/link');
const User = require('./models/user');

const checkAuth = require('./middleware/check-auth');
const getUser = require('./middleware/get-user');

const app = express();

app.use(Cors());

mongoose.connect('mongodb://localhost:27017/links', { useUnifiedTopology: true, useNewUrlParser: true  })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      message: "Bad body params"
    });
  } else {
    next();
  }
});

app.post('/api/short_url', async (req, res, next) => {
  const longUrl = req.body.long_url;

  if(!longUrl || !validUrl.isUri(longUrl)){
    console.log("Bad URL");
    return res.status(400).json({
      message: "Bad url"
    })
  }
  try {
    const link = await Link.findOne({link: req.body.long_url, anonymous: true}).exec();
    if (link) {
      console.log("Duplicate URL");
      return res.status(200).json({shortLink: link.shortLink});
    } else {
      const shortLink = await getShortLink();
      const newLink = new Link({link: req.body.long_url, shortLink: shortLink, anonymous: true});
      newLink.save()
        .then((link) => {
          return res.json({shortLink});
        })
        .catch(error => {
          console.log("Can's save");
          res.status(500).json({message: "Shorting link fail"})
        });
    }
  } catch (e) {
    return res.status(500).json({message: e});
  }
});

app.post('/api/tracked_short_url', checkAuth, async (req, res, next) => {
  const longUrl = req.body.long_url;

  if(!longUrl || !validUrl.isUri(longUrl)){
    return res.status(400).json({
      message: "Bad url"
    })
  }

  try {
    const link = await Link.findOne({link: req.body.long_url, anonymous: false, authorId: res.locals.userId}).exec();
    if (link) {
      return res.status(200).json(link);
    } else {
        const shortLink = await getShortLink();
        const newLink = new Link({link: req.body.long_url,
          shortLink: shortLink,
          anonymous: false,
          authorId: res.locals.userId});
        newLink.save()
          .then((link) => {
            return res.status(201).json({shortLink});
          })
          .catch(error => res.status(500).json({message: "Shorting link fail"}));
    }
  } catch (e) {
    return res.status(500).json({message: e});
  }
});

function getShortLink() {
  return new Promise((resolve, reject) => {
    const shortLink = randomString.generate(6);
    Link.findOne({shortLink: shortLink})
      .then(link => {
        if(link || shortLink === 'signup') {
          console.log("Duplicate Short Link");
          resolve(getShortLink());
        } else {
          resolve(shortLink);
        }
      })
  });
}

app.post('/api/redirect', (req, res, next) => { // tested
  Link.findOne({shortLink: req.body.short_url})
    .then((link, err) => {
      link.clickCounter = link.clickCounter + 1;
      link.save()
        .then(editedLink => {
          return res.status(200).json({"link" : link.link});
        })
        .catch(err => {
          return res.status(404).json({"link" : undefined});
        })
    })
    .catch(err => {
      res.status(404).json({"link" : undefined})
    });
});

app.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        login: req.body.login,
        password: hash
      });
      user
        .save()
        .then(result => {
            return res.status(201).json({
              message: "User Created!",
              user: {login: result.login, _id : result._id}
            });
        })
        .catch((error) => {
          return res.status(500).json({err: error});
        })
    });
});

app.post('/login', (req, res, next) => { // tested
  let fetchedUser;
  User.findOne({login: req.body.login})
    .then((user , reject) => {
      if(!user) {
        return reject();
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, fetchedUser.password);
    })
    .then(result => {
      if(!result) {
        return res.status(401).json({message: "Auth failed"});
      }
      const token = jwt.sign(
        {login: fetchedUser.login, userId: fetchedUser._id},
        "secret_this_should_be_longer",
        { expiresIn: "1h"}
        );

      return res.status(200).json({token: token, expiresIn: 3600, userId: fetchedUser._id});
    })
    .catch(() => {
      return res.status(401).json({message: "Auth failed"});
    });
});

app.post('/statistics', checkAuth, (req, res, next) => {
  Link.find({authorId: res.locals.userId})
    .then(links => {
      return res.status(200).json({links: links});
    })
    .catch(() => {
      return res.status(200).json({message: "No links for statistics"});
    });
});

module.exports = app;
