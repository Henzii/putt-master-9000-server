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
exports.setBeersDrank = exports.closeGame = exports.setScore = exports.createGame = exports.addPlayersToGame = exports.getGames = exports.getGame = void 0;
const Game_1 = __importDefault(require("../models/Game"));
const Course_1 = __importDefault(require("../models/Course"));
const mongoose_1 = __importDefault(require("mongoose"));
const getGame = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Game_1.default.findById(id).populate({
        path: 'scorecards',
        populate: {
            path: 'user'
        }
    });
});
exports.getGame = getGame;
const getGames = (userId, populateUsers = false) => __awaiter(void 0, void 0, void 0, function* () {
    const uId = new mongoose_1.default.Types.ObjectId(userId);
    if (populateUsers) {
        return yield Game_1.default.find({
            'scorecards.user': userId
        }).populate({
            path: 'scorecards',
            populate: {
                path: 'user'
            }
        });
    }
    else {
        const games = yield Game_1.default.find({
            'scorecards.user': userId
        }).sort({ date: -1 });
        return games;
    }
});
exports.getGames = getGames;
const addPlayersToGame = (gameId, playerIds) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(gameId, playerIds);
    const game = yield Game_1.default.findOneAndUpdate({ _id: gameId }, {
        $addToSet: {
            scorecards: playerIds.map(p => {
                return { user: p, scores: [] };
            })
        }
    });
    console.log(game);
    return game;
});
exports.addPlayersToGame = addPlayersToGame;
const createGame = (courseId, layoutId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const course = yield Course_1.default.findById(courseId);
        if (!course) {
            throw new Error('Course not found!!');
        }
        const layout = course.layouts.find(l => l.id === layoutId);
        if (!layout) {
            throw new Error('Layout not found!!');
        }
        const newGame = new Game_1.default({
            date: new Date(),
            layout: layout === null || layout === void 0 ? void 0 : layout.name,
            course: course.name,
            pars: layout === null || layout === void 0 ? void 0 : layout.pars,
            holes: layout === null || layout === void 0 ? void 0 : layout.holes,
            isOpen: true,
            scorecards: [],
        });
        yield newGame.save();
        return newGame.id;
    }
    catch (e) {
        console.log(e);
    }
});
exports.createGame = createGame;
const setScore = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_1.default.findById(args.gameId);
    game.scorecards = game.scorecards.map(s => {
        if (s.user.toString() === args.playerId) {
            s.scores[args.hole] = args.value;
            return s;
        }
        return s;
    });
    yield game.save();
    return game;
});
exports.setScore = setScore;
const closeGame = (gameId) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_1.default.findByIdAndUpdate(gameId, {
        isOpen: false
    }, { returnDocument: 'after' });
    return game;
});
exports.closeGame = closeGame;
const setBeersDrank = (gameId, playerId, beers) => __awaiter(void 0, void 0, void 0, function* () {
    const game = yield Game_1.default.findById(gameId);
    game.scorecards = game.scorecards.map(sc => {
        if (sc.user.toString() === playerId) {
            sc['beers'] = beers;
        }
        return sc;
    });
    return yield game.save();
});
exports.setBeersDrank = setBeersDrank;
exports.default = { getGame: exports.getGame, getGames: exports.getGames, createGame: exports.createGame, addPlayersToGame: exports.addPlayersToGame, setScore: exports.setScore, closeGame: exports.closeGame, setBeersDrank: exports.setBeersDrank };
const games = [];
