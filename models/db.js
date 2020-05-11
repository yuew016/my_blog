var config = require('config-lite')(__dirname);
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = config.mongodb;

var Db = new Object();

//存入数据
Db.insert = function (collection, data, callback) {
    MongoClient.connect(url, function (err, db) {
        //错误处理
        if (err) {
            //关闭数据库连接
            db.close();
            return callback(err);
        }
        db.collection(collection).insert(data, function (err, result) {
            //错误处理
            if (err) {
                db.close();
                return callback(err);
            }
            db.close();
            //返回存储的数据
            callback(null, result);
        });
    });
};

//查找一条数据
Db.findOne = function (collection, query, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).findOne(query, function (err, result) {
            if (err) {
                db.close();
                return callback(err);
            }
            db.close();
            //返回查找到的数据
            callback(null, result);
        });
    });
};

//根据 _id 查找一条数据
Db.findOneById = function (collection, id, callback) {
    var _id = new ObjectID(id);
    MongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).findOne({ _id: _id }, function (err, result) {
            if (err) {
                db.close();
                return callback(err);
            }
            db.close();
            callback(null, result);
        });
    });
};

//查找某个 collection 中的文档
Db.find = function (collection, query, callback) {
    MongoClient.connect(url, function (err, db) {
        if (err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).find(query).toArray(function (err, result) {
            if (err) {
                db.close();
                return callback(err);
            }
            db.close();
            callback(null, result);
        });
    });
};

//通过id编辑某个文档
Db.edit = function (collection, id, query, callback) {
    var _id = new ObjectID(id);
    MongoClient.connect(url, function (err, db) {
        if(err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).update({ _id: _id }, { $set: query }, function (err) {
            if(err) {
                db.close();
                return callback(err);
            }
            db.close();
            callback(null);
        });
    });
};

//通过id移除某个文档
Db.remove = function(collection, id, callback) {
    var _id = new ObjectID(id);
    MongoClient.connect(url, function (err, db) {
        if(err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).remove({ _id: _id }, function(err) {
            if(err) {
                db.close();
                return callback(err);
            }
            db.close();
            callback(null);
        });
    });
};

//向文档中的数组添加元素 评论
Db.push = function(collection, id, query, callback) {
    var _id = new ObjectID(id);
    MongoClient.connect(url, function(err, db) {
        if(err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).update({ _id: _id }, { $push: query }, function(err) {
            if(err) {
                db.close();
                return callback(err);
            }
            db.close();
            callback(null);
        });
    });
};

//让文档某数值增加
Db.inc = function(collection, id, query, callback) {
    var _id = new ObjectID(id);
    MongoClient.connect(url, function(err, db) {
        if(err) {
            db.close();
            return callback(err);
        }
        db.collection(collection).update({ _id: _id }, { $inc: query }, function(err) {
            if(err) {
                db.close();
                return callback(err);
            }
            db.close();
            callback(null);
        });
    });
};
module.exports = Db;