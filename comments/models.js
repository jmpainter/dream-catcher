const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = Schema({
  dream: {type: Schema.Types.ObjectId, ref: 'Dream', required: true},
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  text: {type: String, required: true},
  publishDate: {type: Date, default: Date.now},
});

commentSchema.methods.serialize = function() {
  return {
    id: this._id,
    author: this.author,
    dream: this.dream,
    text: this.text,
    publishDate: this.publishDate
  };
};

//Mongoose middelware function that will delete comment reference in
//Dream document comments array when a comment is deleted
commentSchema.pre('remove', function (next) {
  var comment = this;
  comment.model('Dream').update(
    { _id: comment.dream}, 
    { $pull: { comments: comment._id } },
    next
  );
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = {Comment};