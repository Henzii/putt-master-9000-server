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
import { log } from './utils/log';

const SERVER_PATH = '/';

const app = express();
const httpServer = http.createServer(app);

const schema = makeExecutableSchema({typeDefs, resolvers});

const wsServer = new WebSocketServer({
    server: httpServer,
    path: SERVER_PATH,
});

const cleanup = useServer({
    schema,
    onConnect: () => log('Sub connected...'),
    onComplete: (_ctx, message) => log(['Sub completed', message]),
    context: async (context) => {
        return validateToken(context?.connectionParams?.Authorization as string);
    }
}, wsServer );

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
        return ({ user: null } as unknown as ContextWithUser);
    }
};

export const startServer = async() => {
    await server.start();
    app.use(
        SERVER_PATH,
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
    log(['🚀 Server running on port', port], false);
};
