const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the course'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add description for the course'],
  },
  weeks: {
    type: String,
    required: [true, 'Please add course duration in week'],
  },
  tuition: { type: Number, required: [true, 'Please add tuition cost'] },
  minimumSkill: {
    type: String,
    required: [true, 'Please add minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'],
  },
  scholarshipAvailable: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  bootcamp: { type: mongoose.Schema.ObjectId, ref: 'Bootcamp', required: true },
});
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: '$bootcamp',
        averageCost: { $avg: '$tuition' },
      },
    },
  ]);
  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.error(error);
  }
};
// Call getAverateCost after save
CourseSchema.post('save', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverateCost before remove
CourseSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
