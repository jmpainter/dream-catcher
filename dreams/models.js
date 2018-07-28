const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dreamSchema = Schema({
  title: {type: String, required: true},
  author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  text: {type: String, required: true},
  publishDate: {type: Date, default: Date.now},
  public: {type: Boolean, default: false},
  commentsOn: {type: Boolean, default: false},
  comments: [
    {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Comment"
    }
  ]
});

dreamSchema.methods.serialize = function() {
  return {
    id: this._id,
    title: this.title,
    text: this.text,
    publishDate: this.publishDate,
    public: this.public,
    commentsOn: this.commentsOn,
    comments: this.comments
  };
};

const Dream = mongoose.model('Dream', dreamSchema);

module.exports = { Dream };