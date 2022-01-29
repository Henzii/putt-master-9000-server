import { ApolloServer, gql } from 'apollo-server';
import { server } from './graphql/index';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Yhteys mongoDB:hen
console.log('Connecting to MongoDb...')
mongoose.connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB!');
}).catch((error) => {
    console.log('\n╔═══════════════════════════════════╗\n' +
                '║ Error when connecting to MongoDb! ║\n' +
                '╚═══════════════════════════════════╝\n',
                error.message, '\n\n'
    );
})

server.listen().then(({url}) => console.log('Serveri ' + url))
