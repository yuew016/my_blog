var express = require('express');
var multer = require('multer');
var marked = require('marked');
var router = express.Router();
var crypto = require('crypto');

var storage = multer.diskStorage({
    //设置头像的路径
    destination: './public/images/gravatars',
    //保留原文件的文件名
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage });

var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

var MongoClient=require('mongodb').MongoClient;



// 主页
    router.get('/', function (req, res, next) {
        Post.getAll(function (err, posts) {
            if (err) {
            posts = [];
        }
        res.render('index', { posts: posts });
    });
});
// 注册

router.get('/reg', checkNotLogin,function (req, res, next) {
    res.render('reg');
});

router.post('/reg', checkNotLogin, upload.single('gravatar'), function (req, res, next) {
    var name = req.body.name;
    var password = req.body.password;
    var re_password = req.body.re_password;
    //检验用户两次输入的密码是否一致
    if (re_password != password) {
        req.flash('error', '两次输入的密码不一样');
        return res.redirect('/reg');
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
        password: password,
        gravatar: "images/gravatars/" + req.file.filename
    });
    User.getOneByName(newUser.name, function (err, user) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        if (user) {
            req.flash('error', '用户已存在!');
            return res.redirect('/reg');
        }
        //如果不存在则新增用户
        newUser.save(function (err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            delete user.password;
            req.session.user = user;//用户信息输入session
            req.flash('success', '注册成功！');
            res.redirect('/');//注册成功后返回主页
        });
    });
});

// 登录
router.get('/login', checkNotLogin,function (req, res, next) {
    res.render('login');
});

router.post('/login', checkNotLogin,function (req, res, next) {
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.getOneByName(req.body.name, function (err, user) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/login');
        }
        if (!user) {
            req.flash('error', '用户不存在！');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '用户名或密码错误！');
            return res.redirect('/login');
        }
        //用户名和密码都匹配后，登录成功，将用户名存入session
        delete user.password;
        req.session.user = user;
        req.flash('success', '登录成功！');
        res.redirect('/');
    });
});

//注销
router.get('/logout', checkLogin,function (req, res, next) {
    req.session.user = null;
    req.flash('success', '注销成功！');
    res.redirect('/');
});

// 发表文章
router.get('/post', checkLogin,function (req, res, next) {
    res.render('post');
});

router.post('/post', checkLogin, function (req, res, next) {
    var post = new Post({
        author: req.session.user, 
        title: req.body.title, 
        content: req.body.content, 
        postDate: new Date()
    });
    post.save(function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '发表成功！');
        res.redirect('/post/' + post._id);//跳转到文章页
    });
});


// 查看文章
router.get('/post/:postId', function (req, res, next) {
    var id = req.params.postId;
    Post.getOneById(id, function (err, post) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }
    Post.pv(id, function(err){
            //将文章内容用marked解析
            post.content = marked(post.content);
            // res.render('article', { post: post });
            post.comments.forEach(function(comment, index) {
                 comment.content = marked(comment.content);    
             })
            res.render('article', { post: post
                // title:article,
                // comment:comment
             });
        });
    });
});

//确保用户为登录状态
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录！');
        return res.redirect('/login');
    }
    next();
}

//确保用户为未登录状态
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录！');
        return res.redirect('back'); //返回之前页面
    }
    next();
}

//编辑一篇文章
router.get('/edit/:postId', checkLogin, function (req, res, next) {
    var id = req.params.postId;
    Post.getOneById(id, function (err, post) {
        if(err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        //检测是否是文章作者
        if(req.session.user.name != post.author.name) {
            req.flash('error', '没有权限！');
            return res.redirect('back');
        }
        res.render('edit', { post: post });
    });
});

router.post('/edit/:postId', checkLogin, function (req, res, next) {
    var id = req.params.postId;
    var content = req.body.content;
    Post.editPostContent(id, content, function(err) {
        if(err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        req.flash('success', '编辑成功！');
        res.redirect('/post/' + id);
    });
});

//删除一篇文章
router.get('/delete/:postId', checkLogin, function (req, res, next) {
    var id = req.params.postId;
    Post.getOneById(id, function(err, post) {
        if(err) {
            req.flash('error', err);
            return res.redirect('back');
        }
        if(req.session.user.name != post.author.name) {
            req.flash('error', '没有权限！');
            return res.redirect('back');
        }
        Post.removePost(id, function(err) {
            if(err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功！');
            res.redirect('/');
        })
    });
});

//添加一条留言
router.post('/comment/:postId', checkLogin, function(req, res, next) {
    var id = req.params.postId;
    var comment = new Comment({
        author: req.session.user,
        content: req.body.comment,
        date: new Date()
    });
    comment.save(id, function(err) {
        if(err) {
            req.flash('error', '评论失败！');
        }
        req.flash('success', '评论成功！');
        res.redirect('/post/' + id);
    });
});

//站内搜索
router.get('/search', function(req, res) {
    Post.search(req.query.keyword, function(err, posts) {
        if(err) {
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('search', {
            keyword: req.query.keyword,
            posts:posts 
        });
    });
});
module.exports = router;
