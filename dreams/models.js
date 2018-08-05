const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Comment } = require('../comments/models');

mongoose.Promise = global.Promise;

const dreamSchema = Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  publishDate: { type: Date, default: Date.now },
  public: { type: Boolean, default: false },
  commentsOn: { type: Boolean, default: false },
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

//Mongoose middelware function that will delete dream reference in
//User document's dreams array and any comments the dream had when a dream is deleted
dreamSchema.pre('remove', function (next) {
  var dream = this;
  promiseArr = [];
  Comment.deleteMany({'_id': {$in: dream.comments}})
    .then(() => {
      dream.model('User').update(
        { _id: dream.author}, 
        { $pull: { dreams: dream._id } },
        next
      );
    })
    .catch(err => console.error(err));
});

const Dream = mongoose.model('Dream', dreamSchema);

module.exports = { Dream };
