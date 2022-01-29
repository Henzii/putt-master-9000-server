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
exports.mutations = void 0;
const courseService_1 = require("../services/courseService");
const gameService_1 = __importDefault(require("../services/gameService"));
const userService_1 = __importDefault(require("../services/userService"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const apollo_server_1 = require("apollo-server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.mutations = {
    Mutation: {
        addCourse: (_root, args) => {
            return (0, courseService_1.addCourse)(args.name);
        },
        addLayout: (_root, args) => {
            return (0, courseService_1.addLayout)(args.courseId, args.layout);
        },
        // Game mutations
        createGame: (_root, args) => {
            return gameService_1.default.createGame(args.courseId, args.layoutId);
        },
        addPlayersToGame: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            return yield gameService_1.default.addPlayersToGame(args.gameId, args.playerIds);
        }),
        setScore: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            return yield gameService_1.default.setScore(args);
        }),
        // User mutations
        createUser: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(args.password, 10);
            try {
                const newId = yield userService_1.default.addUser(args.name, hashedPassword, args.email);
                return newId;
            }
            catch (e) {
                const viesti = e.message;
                if (viesti.includes('to be unique'))
                    throw new apollo_server_1.UserInputError(`Name ${args.name} is already taken!`);
                throw new apollo_server_1.UserInputError(`Error when creating accoount! (${e.name})`);
            }
        }),
        addFriend: (_root, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            return yield userService_1.default.makeFriends({ id: context.user.id }, { id: args.friendId, name: args.friendName });
        }),
        login: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield userService_1.default.getUser(args.user);
            if (!user || !(yield bcrypt_1.default.compare(args.password, user.passwordHash))) {
                throw new apollo_server_1.UserInputError('Wrong username or password');
            }
            else {
                const payload = {
                    id: user.id,
                    name: user.name,
                };
                return jsonwebtoken_1.default.sign(payload, process.env.TOKEN_KEY || 'NoKey?NoProblem!#!#!R1fdsf13rn');
            }
        })
    }
};
