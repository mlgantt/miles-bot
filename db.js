var db = require('monk');
/*
** MongoDB Driver for Botkit
*/
module.exports = function(config) {

    if (!config || !config.mongoUri)
        throw new Error('Need to provide mongo url.');

    var Teams = db(config.mongoUri).get('teams'),
        Users = db(config.mongoUri).get('users'),
        Channels = db(config.mongoUri).get('channels');

    var unwrapFromList = function(cb) {
        return function(err, data) {
            if (err) return cb(err);
            cb(null, data);
        };
    };

    var storage = {
        teams: {
            get: function(id, cb) {
                Teams.findOne({id: id}, unwrapFromList(cb));
            },
            save: function(data, cb) {
                Teams.findOneAndUpdate({
                    id: data.id
                }, data, {
                    upsert: true,
                    new: true
                }, cb);
            },
            all: function(cb) {
                Teams.find({}, cb);
            }
        },
        users: {
            get: function(id, cb) {
                Users.findOne({id: id}, unwrapFromList(cb));
            },
            save: function(data, cb) {
                Users.findOneAndUpdate({
                    id: data.id
                }, data, {
                    upsert: true,
                    new: true
                }, cb);
            },
            all: function(cb) {
                Users.find({}, cb);
            }
        },
        channels: {
            get: function(id, cb) {
                Channels.findOne({id: id}, unwrapFromList(cb));
            },
            save: function(data, cb) {
                Channels.findOneAndUpdate({
                    id: data.id
                }, data, {
                    upsert: true,
                    new: true
                }, cb);
            },
            all: function(cb) {
                Channels.find({}, cb);
            }
        }
    };

    return storage;
};