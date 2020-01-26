const log4js = require('log4js');
const mongoose = require('mongoose');

const schema = new mongoose.Schema(require('../schemas/user.schema'));
const logger = log4js.getLogger('user.model');

// schema.post('save', function (doc, next) {
//     logger.info('Post save called');
//     next();
// });

const model = mongoose.model('users', schema, 'users');


/**
 * 
 * @param {string} username Username of user
 */
function findByUsername(username) {
    return new Promise((resolve, reject) => {
        model.findOne({ username }).exec().then(data => {
            if (Array.isArray(data)) {
                resolve(data[0]);
            } else {
                resolve(data);
            }
        }).catch(err => {
            logger.error(err);
            reject(err);
        });
    });
}



function createUser(payload) {
    return new Promise((resolve, reject) => {
        const doc = new model(payload);
        doc.save().then(result => {
            resolve(result);
        }).catch(err => {
            logger.error(err);
            reject(err);
        });
    });
}



module.exports.findByUsername = findByUsername;
module.exports.createUser = createUser;