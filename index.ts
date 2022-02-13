import { server } from './graphql/index';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Yhteys mongoDB:hen
const db_uri = ((process.env.NODE_ENV === 'development') ? process.env.MONGO_URI_DEV : process.env.MONGO_URI) as string
console.log('Connecting to MongoDb...')
mongoose.connect(db_uri).then(() => {
    console.log('Connected to MongoDB!');
}).catch((error) => {
    console.log('\n╔═══════════════════════════════════╗\n' +
                '║ Error when connecting to MongoDb! ║\n' +
                '╚═══════════════════════════════════╝\n',
                error.message, '\n\n'
    );
})

server.listen(process.env.PORT || 8080).then(({url}) => console.log('Serveri ' + url))
