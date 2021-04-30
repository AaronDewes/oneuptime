const MongoClient = require('mongodb').MongoClient;
const url = process.env['MONGO_URL'] || 'mongodb://localhost/fyipedb';

global.client = global.client || MongoClient;

async function connectToDb() {
    return global.client.connect(url, { useUnifiedTopology: true });
}

async function find(collection, query = {}) {
    return global.db
        .collection(collection)
        .find(query)
        .toArray();
}

async function save(collection, docs) {
    return global.db.collection(collection).insertMany(docs);
}

async function update(collection, query, value) {
    return global.db.collection(collection).updateOne(query, { $set: value });
}

async function updateAll(collection, query, value) {
    return global.db.collection(collection).update(query, { $set: value });
}

async function removeField(collection, query, field) {
    return global.db
        .collection(collection)
        .updateOne(query, { $unset: field }, { multi: true });
}

async function rename(oldCollectionName, newCollectionName) {
    return global.db
        .listCollections({ name: oldCollectionName })
        .next(function(err, collinfo) {
            if (collinfo) {
                // The collection exists
                global.db
                    .collection(oldCollectionName)
                    .rename(newCollectionName);
            }
        });
}

async function getVersion() {
    const docs = await global.db
        .collection('globalconfigs')
        .find({ name: 'version' })
        .toArray();

    if (docs.length > 0) {
        return docs[0].value;
    }

    return null;
}

module.exports = {
    connectToDb,
    find,
    save,
    update,
    getVersion,
    removeField,
    rename,
    updateAll,
};
