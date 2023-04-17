/* eslint-disable no-console */
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { json } from 'body-parser';
import { typeDefs} from './graphql/typeDefs';
import { resolvers } from './graphql/index';
import { ContextWithUser, SafeUser } from './types';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';


const app = express();
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({typeDefs, resolvers});

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
});

const cleanup = useServer({schema, onConnect: async (ctx) => {
//    const token = ctx?.connectionParams?.Authorization as string;
//    if (!token || !validateToken(token)?.user) throw new Error('Not authorized');
}}, wsServer);

const server = new ApolloServer<ContextWithUser>({
    schema,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await cleanup.dispose();
                    }
                };
            }
        }
    ],
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
