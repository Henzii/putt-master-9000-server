/* eslint-disable no-console */
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { json } from 'body-parser';
import { typeDefs} from './graphql/typeDefs';
import { resolvers } from './graphql/index';
import { ContextWithUser, SafeUser } from './types';

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<ContextWithUser>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const validateToken = (authorization?: string): ContextWithUser => {
    try {
        if (!authorization || !process.env.TOKEN_KEY) {
            throw new Error('Missing authorization header or token key');
        }
        const token = authorization?.slice(7);
        const decodedUser = jwt.verify(token, process.env.TOKEN_KEY) as SafeUser;
        return {
            user: {
                id: decodedUser.id,
                name: decodedUser.name
            }
        };
    } catch {
        return { user: null };
    }
};

export const startServer = async() => {
    await server.start();
    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                return validateToken(req.headers.authorization);
            }
        }),
    );
    const port = process.env.PORT || 8080;
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
    console.log(`🚀 Server running on port ${port}`);
};
