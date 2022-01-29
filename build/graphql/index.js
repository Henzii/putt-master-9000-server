"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const apollo_server_1 = require("apollo-server");
const typeDefs_1 = require("./typeDefs");
const queries_1 = require("./queries");
const mutations_1 = require("./mutations");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const permissions_1 = __importDefault(require("./permissions"));
const graphql_middleware_1 = require("graphql-middleware");
const schema_1 = require("@graphql-tools/schema");
const resolvers = Object.assign(Object.assign(Object.assign({}, queries_1.queries), mutations_1.mutations), { Layout: {
        par: (root) => {
            return root.pars.reduce((p, c) => (p + c), 0);
        },
    }, User: {
        friends: (root) => __awaiter(void 0, void 0, void 0, function* () {
            yield root.populate('friends');
            return root.friends;
        })
    } });
const schema = (0, graphql_middleware_1.applyMiddleware)((0, schema_1.makeExecutableSchema)({ typeDefs: typeDefs_1.typeDefs, resolvers }), permissions_1.default);
exports.server = new apollo_server_1.ApolloServer({
    typeDefs: typeDefs_1.typeDefs,
    resolvers,
    schema,
    context: ({ req }) => {
        var _a, _b;
        const token = (_b = ((_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization)) === null || _b === void 0 ? void 0 : _b.slice(7);
        if (token && process.env.TOKEN_KEY) {
            try {
                const decode = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
                return {
                    user: {
                        id: decode.id,
                        name: decode.name,
                    }
                };
            }
            catch (e) {
                return null;
            }
        }
    }
});
