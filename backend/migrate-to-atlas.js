// Copies every collection from the local MongoDB (MONGODB_URI in .env)
// into an Atlas database, preserving _ids, password hashes and settings.
//
// Usage:
//   node migrate-to-atlas.js "<atlas-connection-string>"
//   (or set ATLAS_MONGODB_URI and run: node migrate-to-atlas.js)
//
// This REPLACES the matching collections in Atlas (delete + insert per collection).

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const localUri = process.env.MONGODB_URI;
const atlasUri = process.argv[2] || process.env.ATLAS_MONGODB_URI;

if (!localUri) {
  console.error('MONGODB_URI (local) is not set in backend/.env');
  process.exit(1);
}
if (!atlasUri) {
  console.error('Provide the Atlas URI: node migrate-to-atlas.js "<atlas-connection-string>"');
  process.exit(1);
}
if (/mongodb\.net|mongodb\+srv/.test(localUri)) {
  console.error('MONGODB_URI already points at Atlas. Refusing to migrate onto itself.');
  process.exit(1);
}

const connect = (uri) =>
  mongoose.createConnection(uri, { serverSelectionTimeoutMS: 20000 }).asPromise();

(async () => {
  let local;
  let atlas;
  try {
    console.log('Connecting to local MongoDB...');
    local = await connect(localUri);
    console.log('Connecting to Atlas...');
    atlas = await connect(atlasUri);

    const names = (await local.db.listCollections().toArray())
      .map((c) => c.name)
      .sort();

    if (!names.length) {
      console.log('Local database has no collections. Nothing to migrate.');
      return;
    }

    console.log('\nMigrating ' + names.length + ' collections:\n');
    let total = 0;
    for (const name of names) {
      const docs = await local.db.collection(name).find({}).toArray();
      const target = atlas.db.collection(name);
      await target.deleteMany({});
      if (docs.length) await target.insertMany(docs, { ordered: false });
      total += docs.length;
      console.log('  ' + name.padEnd(20) + ' -> ' + docs.length + ' docs');
    }

    console.log('\nMigration complete. ' + total + ' documents copied to Atlas.');
  } catch (err) {
    console.error('Migration failed: ' + err.message);
    process.exitCode = 1;
  } finally {
    if (local) await local.close();
    if (atlas) await atlas.close();
  }
})();
