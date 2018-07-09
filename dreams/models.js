const mongoose = require('mongoose');

const dreamSchema = mongoose.Schema({
  title: {type: String, required: true},
  authorId: {type: ObjectId, required: true},
  text: {type: String, required: true},
  publishDate: {type: Date, required: true},
});

