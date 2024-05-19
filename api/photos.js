const { Router } = require('express')
const { ValidationError } = require('sequelize')

const { Photo, PhotoClientFields } = require('../models/photo')
const { User } = require('../models/user')
const { requireAuthentication } = require('../lib/auth')

const router = Router()

/*
 * Route to create a new photo.
 */
router.post('/', requireAuthentication, async function (req, res, next) {
  const user = await User.findByPk(req.user);
  if ((req.user !== req.body.userId) && (user.admin == false)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    try {
      const photo = await Photo.create(req.body, PhotoClientFields)
      res.status(201).send({ id: photo.id })
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
 * Route to fetch info about a specific photo.
 */
router.get('/:photoId', async function (req, res, next) {
  const photoId = req.params.photoId
  const photo = await Photo.findByPk(photoId)
  if (photo) {
    res.status(200).send(photo)
  } else {
    next()
  }
})

/*
 * Route to update a photo.
 */
router.patch('/:photoId', requireAuthentication, async function (req, res, next) {
  const photoId = req.params.photoId

  const user = await User.findByPk(req.user);
  const photo = await Photo.findByPk(req.params.photoId);
  if ((req.user !== parseInt(req.body.userId)) && (user.admin == false) || (req.user !== photo.userId)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    /*
    * Update photo without allowing client to update businessId or userId.
    */
    const result = await Photo.update(req.body, {
      where: { id: photoId },
      fields: PhotoClientFields.filter(
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
 * Route to delete a photo.
 */
router.delete('/:photoId', requireAuthentication, async function (req, res, next) {
  const user = await User.findByPk(req.user);
  const photo = await Photo.findByPk(req.params.photoId);
  if ((req.user !== photo.userId) && (user.admin == false)) {
    res.status(403).json({error: "Unauthorized to access the specified resource"});
  } else {
    const photoId = req.params.photoId
    const result = await Photo.destroy({ where: { id: photoId }})
    if (result > 0) {
      res.status(204).send()
    } else {
      next()
    }
  }
})

module.exports = router
