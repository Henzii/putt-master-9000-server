import { ApolloServer, gql } from 'apollo-server';
import { server } from './graphql/index';

server.listen().then(({url}) => console.log('Serveri ' + url))
