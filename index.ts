/* eslint-disable no-console */
// import { server } from './graphql/index';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startServer } from './server/server';

dotenv.config();

const ENV = process.env.NODE_ENV === 'development' && !process.argv.includes('--use-production-data') ? 'dev' : 'prod';

// Yhteys mongoDB:hen
const db_uri = ENV === 'dev' ? process.env.MONGO_URI_DEV : process.env.MONGO_URI as string;

if (!db_uri) {
    console.log('Database uri undefined!');
    process.exit();
}

if (ENV === 'prod') {
    console.log('----------------\n' +
                '| !PRODUCTION! |\n' +
                '----------------'
    );
}

console.log('Connecting to MongoDb...');
mongoose.connect(db_uri).then(() => {
    console.log('Connected to MongoDB!');
}).catch((error) => {
    console.log('\n╔═══════════════════════════════════╗\n' +
                '║ Error when connecting to MongoDb! ║\n' +
                '╚═══════════════════════════════════╝\n',
                error.message, '\n\n'
    );
});

startServer();

// server.listen(process.env.PORT || 8080).then(({url}) => console.log('Serveri ' + url));
