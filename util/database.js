const mongoose = require('mongoose');
const URI = 'mongodb+srv://ajayb:eshop@node-nosql-p4wwm.mongodb.net/eshop-mongoose?retryWrites=true';

// const mongooseConnect = () => {
//   return  mongoose.connect(URI)
// };

module.exports = {uri: URI};
//module.exports = mongooseConnect;
//exports.getDb = getDb;