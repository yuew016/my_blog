var Db = require('./db');

function Post(post) {
    this.author = post.author;
    this.title = post.title;
    this.content = post.content;
    this.postDate = post.postDate;
    this.comments = post.comments;
}

module.exports = Post;

//存储一篇文章
Post.prototype.save = function(callback) {
    var post = {
        author: this.author,
        title: this.title,
        content: this.content,
        postDate: this.postDate,
        comments: [],
        pv: 0,
    };
    Db.insert('posts', post, function(err, post) {
        if(err) {
            return callback(err);
        }
        callback(null, post.ops[0]);
    });
};

//获取全部文章
Post.getAll = function(callback) {
    var query = {}
    Db.find('posts', query, function(err, posts) {
        if(err) {
            return callback(err);
        }
        callback(null, posts);
    });
};

//通过id获取一篇文章
Post.getOneById = function(id, callback) {
    Db.findOneById('posts', id, function(err, post) {
        if(err){
            return callback(err);
        }
        callback(null, post);
    });
};

//通过id编辑一篇文章
Post.editPostContent = function(id, content, callback) {
    var query = { content: content };
    Db.edit('posts', id, query, function(err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    });
};

//通过id删除一篇文章
Post.removePost = function(id, callback) {
    Db.remove('posts', id, function(err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    });
};

//通过关键字搜索
Post.search = function(keyword, callback) {
    var pattern = new RegExp(keyword, 'i');
    var query = { 'title': pattern };
    Db.find('posts',query, function(err, posts) {
        if(err) {
            return callback(err);
        }
        callback(null, posts);
    });
};

// 文章pv统计
Post.pv = function(id, callback) {
    var query = { "pv": 1 };
    Db.inc('posts', id, query, function(err) {
        if(err) {
            return callback(err);
        }
        callback(null);
    });
};