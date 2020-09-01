const express = require('express');

const advancedResult = require('../middlewares/advancedResult');
const Bootcamp = require('../models/Bootcamp');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
// includes other resources routers
const courseRouter = require('./courses');
const router = express.Router();
// Re-route into other resources routers
router.use('/:bootcampId/courses', courseRouter);
router
  .route('/')
  .get(advancedResult(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/:id/photo').put(bootcampPhotoUpload);
module.exports = router;
