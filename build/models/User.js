"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const skeema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    email: String,
    friends: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    Games: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Game'
        }
    ]
});
skeema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString();
        delete returnedObj._id;
        delete returnedObj._v;
    }
});
exports.default = mongoose_1.default.model('User', skeema);
