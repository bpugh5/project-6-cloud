const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Review, ReviewClientFields } = require('../models/review')
const { User } = require('../models/user')
const { requireAuthentication } = require('../lib/auth')

const router = Router()

/*
 * Route to create a new review.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
  const user = await User.findByPk(req.user);
  if ((req.user !== req.body.userId) && (user.admin == false)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    try {
      const review = await Review.create(req.body, ReviewClientFields)
      res.status(201).send({ id: review.id })
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).send({ error: e.message })
      } else {
        throw e
      }
    }
  }
})

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewId', async function (req, res, next) {
  const reviewId = req.params.reviewId
  const review = await Review.findByPk(reviewId)
  if (review) {
    res.status(200).send(review)
  } else {
    next()
  }
})

/*
 * Route to update a review.
 */
router.patch('/:reviewId', requireAuthentication, async function (req, res, next) {
  const reviewId = req.params.reviewId

  const user = await User.findByPk(req.user);
  const review = await Review.findByPk(req.params.reviewId);
  if ((req.user !== parseInt(req.body.userId)) && (user.admin == false) || (req.user !== review.userId)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    /*
    * Update review without allowing client to update businessId or userId.
    */
    const result = await Review.update(req.body, {
      where: { id: reviewId },
      fields: ReviewClientFields.filter(
        field => field !== 'businessId' && field !== 'userId'
      )
    })
    if (result[0] > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }
})

/*
 * Route to delete a review.
 */
router.delete('/:reviewId', requireAuthentication, async function (req, res, next) {
  const user = await User.findByPk(req.user);
  const review = await Review.findByPk(req.params.reviewId);
  if ((req.user !== review.userId) && (user.admin == false)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    const reviewId = req.params.reviewId;
    const result = await Review.destroy({ where: { id: reviewId }});
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }
})

module.exports = router
