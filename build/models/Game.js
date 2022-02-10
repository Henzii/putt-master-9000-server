"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const skeema = new mongoose_1.default.Schema({
    date: String,
    course: String,
    layout: String,
    pars: [Number],
    holes: Number,
    scorecards: [
        {
            user: {
                type: mongoose_1.default.Types.ObjectId,
                ref: 'User'
            },
            scores: [],
            _id: false,
            beers: {
                type: Number,
                default: 0,
            }
        }
    ],
    isOpen: Boolean,
});
exports.default = mongoose_1.default.model('Game', skeema);
