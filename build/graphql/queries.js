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
exports.queries = void 0;
const courseService_1 = require("../services/courseService");
const gameService_1 = require("../services/gameService");
const userService_1 = __importDefault(require("../services/userService"));
exports.queries = {
    Query: {
        getCourses: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, courseService_1.getCourses)(args);
        }),
        getMe: (_root, args, context) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            return yield userService_1.default.getUser(undefined, (_a = context.user) === null || _a === void 0 ? void 0 : _a.id);
        }),
        getGames: (r, r2, context, r4) => __awaiter(void 0, void 0, void 0, function* () {
            // Jos kyselyssä kysytään user:ia -> parametriksi true -> user populoidaan.
            return yield (0, gameService_1.getGames)(context.user.id, r4.fieldNodes[0].selectionSet.loc.source.body.includes('user {'));
        }),
        getGame: (_root, args) => __awaiter(void 0, void 0, void 0, function* () {
            if (!args.gameId)
                throw new Error('Not enough parameters');
            return yield (0, gameService_1.getGame)(args.gameId);
        }),
        ping: () => 'pong!',
        getUsers: () => __awaiter(void 0, void 0, void 0, function* () {
            return yield userService_1.default.getUsers();
        }),
    }
};
