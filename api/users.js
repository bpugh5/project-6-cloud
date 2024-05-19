const { Router } = require('express')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User, UserClientFields } = require('../models/user');
const { requireAuthentication } = require('../lib/auth');

const secret_key = process.env.APP_SECRET_KEY;

const router = Router()

function generateAuthToken(user_id) {
  const payload = { "sub": user_id };
  return jwt.sign(payload, secret_key, { "expiresIn": "24h"});
}

router.post("/", async (req, res) => {
  let potentialAdmin;

  try {
    if (req.body.admin && req.body.admin == true) {
      const auth_header = req.get('Authorization') || '';
      const header_parts = auth_header.split(' ');
      const token = header_parts[0] == "Bearer"? header_parts[1] : null;
      try {
        const payload = jwt.verify(token, secret_key);
        potentialAdmin = await User.findOne({where: {id: payload.sub}});
        if (potentialAdmin == null) {
          throw new Error;
        }
      } catch(e) {
        return res.status(401).json({"error": "invalid token"});
      }
    }
    if (potentialAdmin == null || potentialAdmin.admin == true) {
      const user = await User.create(req.body, UserClientFields)
      return res.status(201).send({ id: user.id });
    }
    // Account, admin
    return res.status(403).json({"error": "Unauthorized to access the specified resource"})
  } catch(e) {
    return res.status(500).json({"status": "error", "error": e});
  }
});

router.post("/login", async (req, res) => {
  // Get the user record by name
  const user = await User.findOne({where: {name: req.body.name}});

  // Handle no such record
  if (!user) {
    res.status(401).json({"status": "error", "error": "login failed"});
  }

  // Compare the given password with the one in the database
  const authenticated = await bcrypt.compare(req.body.password, user.password);
  
  // If they match, success
  // Otherwise, fail
  if (authenticated) {
    const token = generateAuthToken(user.id);
    res.json({"status": "ok", "token": token});
  }
  else 
    res.status(401).json({"status": "error", "error": "login failed"});
});

router.get('/:userId', requireAuthentication, async function (req, res) {
  const parsedUserId = parseInt(req.params.userId);
  const requestingUser = await User.findByPk(req.user);
  if ((req.user !== parsedUserId) && (requestingUser.admin == false)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    const user = await User.findByPk(parsedUserId);
    if (user) {
      const userBusinesses = await Business.findAll({ where: { ownerId: parsedUserId }});
      const userReviews = await Review.findAll({ where: { userId: parsedUserId }});
      const userPhotos = await Photo.findAll({ where: { userId: parsedUserId }});
      res.status(200).json({"name": user.name, "email": user.email, "isAdmin": user.admin, 
      "businesses": userBusinesses, "reviews": userReviews, "photos": userPhotos });
    } else {
      res.status(401).json({"status": "error", "error": "invalid user"});
    }
  }
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication, async function (req, res) {
  if (req.user !== req.params.userId) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    const userId = req.params.userId;
    const userBusinesses = await Business.findAll({ where: { ownerId: userId }});
    res.status(200).json({
      businesses: userBusinesses
    })
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication, async function (req, res) {
  if (req.user !== req.params.userId) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    const userId = req.params.userId;
    const userReviews = await Review.findAll({ where: { userId: userId }});
    res.status(200).json({
      reviews: userReviews
    })
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication, async function (req, res) {
  if (req.user !== req.params.userId) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    const userId = req.params.userId;
    const userPhotos = await Photo.findAll({ where: { userId: userId }});
    res.status(200).json({
      photos: userPhotos
    })
  }
})

module.exports = router
