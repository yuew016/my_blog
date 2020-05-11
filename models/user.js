var Db = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.gravatar = user.gravatar;
}

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    var user = {
    name: this.name,
    password: this.password,
    gravatar: this.gravatar,
    };
    //向数据库插入信息
    Db.insert('users', user, function(err, user) {
        if(err) {
            return callback(err);
        }
        callback(null, user.ops[0]);
    });
};

//根据用户名获取一条用户信息
User.getOneByName = function(name, callback) {
    Db.findOne('users', {name:name}, function(err, user) {
        if(err) {
            return callback(err);
        }
        callback(null, user);
    });
};

//根据id获取一条用户信息
User.getOneById = function(id, callback) {
    Db.findOne('users', id, function(err, user) {
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};