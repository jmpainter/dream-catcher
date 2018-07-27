const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  text: {type: String, required: true},
  publishDate: {type: Date, default: Date.now},
});

commentSchema.methods.serialize = function() {
  return {
    id: this._id,
    text: this.text,
    publishDate: this.publishDate
  };
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = {Comment};