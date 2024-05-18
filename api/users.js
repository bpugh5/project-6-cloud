const { Router } = require('express')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const secret_key = process.env.APP_SECRET_KEY;

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

const mysqlPool = require('./lib/mysqlPool.js')
app.use(rateLimit);

const ip_to_user = {};

function rateLimit(req, res, next) {
  user_ip = req.ip

  user_bucket_data = ip_to_user[user_ip];  // .tokens, .last

  if (!user_bucket_data) {
      ip_to_user[user_ip] = {
          "tokens": intial_bucket_value,
          "last": cur_req_time
      }
  }

  elapsed = cur_req_time - user_bucket_data.last
  user_bucket_data.last = cur_req_time

  user_bucket_data.tokens += tokens_per_second * elapsed

  if (user_bucket_data.tokens > max_tokens)
      user_bucket_data.tokens = max_tokens

  if (user_bucket_data.tokens > 0) {
      handle_request_normally();
      user_bucket_data.tokens--
  } else {
      // respond with 429
  }
}

function generateAuthToken(user_id) {
  const payload = { "sub": user_id };
  jwt.sign(payload, secret_key, { "expiresIn": "24h"});
}

function requireAuthentication(req, res, next) {
  // Get the token from the request
  const auth_header = req.get('Authorization') || '';
  const header_parts = auth_header.split(' ');

  const token = header_parts[0] == "Bearer"? header_parts[1] : null;

  console.log(token);
  // verify that it's correct

  try {
    const payload = jwt.verify(token, secret_key);
    req.user = payload.sub;
    // If it's ok, next()
    next();
  } catch (err) {
    // otherwise, respond with a 401 error
    res.status(401).json({"error": "invalid token"});
  }
}

app.get("/stuff", requireAuthentication, (req, res) => {

});

app.post("/users/new", async (req, res) => {
  try {
    const hashed_password = await bcrypt.hash(req.body.password, 8);
    const [ results ] = mysqlPool.query(
      `INSERT INTO users 
      (name, email, password) VALUES (?, ?, ?);`,
    [req.body.name, req.body.email, hashed_password]);

    res.json({"status": "ok"});
  } catch(err) {
    res.json({"status": "error", "error": err});
  }
});

app.post("/login", async (req, res) => {
  // Get the user record by name
  const [ results ] = await mysqlPool.query(`
    SELECT * FROM users WHERE name = ?`,
    [req.body.name]);

    // Handle no such record
    if (!results[0]) {
      res.json({"status": "error", "error": "login failed"});
      return;
    }

  // Compare the given password with the one in the database
  const authenticated = await bcrypt.compare(req.body.password, results[0].password);
  
  // If they match, success
  // Otherwise, fail
  if (authenticated) {
    const token = generateAuthToken(req.body.name);
    res.json({"status": "ok", "token": token});
  }
  else 
    res.json({"status": "error", "error": "login failed"});
});

async function init() {
  // Create user table
  let [ results ] = await mysqlPool.query(`CREATE TABLE IF NOT EXISTS users (
    name VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255)
  )`);
}

init();

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
  const userId = req.params.userId
  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

module.exports = router
