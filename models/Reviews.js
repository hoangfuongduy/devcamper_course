const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the review'],
    trim: true,
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add description for the review'],
  },
  rating: {
    type: Number,
    required: [true, 'Please add rating between 1 and 10'],
    min: 1,
    max: 10,
  },
  createdAt: { type: Date, default: Date.now },
  bootcamp: { type: mongoose.Schema.ObjectId, ref: 'Bootcamp', required: true },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});
// prevent user from submitting more than 1 review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
// count the average rating for bootcamp
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.error(error);
  }
};
// Call getAverateCost after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverateCost before remove
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
});
module.exports = mongoose.model('Review', ReviewSchema);
