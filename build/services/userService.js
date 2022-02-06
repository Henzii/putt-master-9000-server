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
const User_1 = __importDefault(require("../models/User"));
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User_1.default.find({});
    if (users.length === 0)
        return [];
    return users;
});
const addUser = (name, passwordHash, email) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = new User_1.default({
        name,
        passwordHash,
        email
    });
    yield newUser.save();
    return newUser;
});
const makeFriends = (userOne, userTwo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fOne = yield getUser(userOne.name, userOne.id);
        const fTwo = yield getUser(userTwo.name, userTwo.id);
        if (!fOne || !fTwo) {
            return false;
        }
        fOne.friends.push(fTwo);
        fTwo.friends.push(fOne);
        yield fOne.save();
        yield fTwo.save();
        return true;
    }
    catch (e) {
        return false;
    }
});
const getUser = (name, id) => __awaiter(void 0, void 0, void 0, function* () {
    let user;
    if (id) {
        user = (yield User_1.default.findById(id));
    }
    else if (name) {
        user = (yield User_1.default.findOne({ name }));
    }
    else {
        return null;
    }
    return user;
});
exports.default = { getUsers, addUser, getUser, makeFriends };
