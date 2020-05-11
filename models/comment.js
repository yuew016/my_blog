var Db = require('./db');

function Comment(comment) {
    this.author = comment.author;
    this.content = comment.content;
    this.date = comment.date;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(id, callback) {
    var comment = {
        author: this.author,
        content: this.content,
        date: this.date
    }
    Db.push('posts', id, { "comments": comment }, function(err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    });
};