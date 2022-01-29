"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const skeema = new mongoose_1.default.Schema({
    name: {
        type: String,
        minlength: 3,
    },
    layouts: [
        {
            name: {
                type: String,
                minlength: 3,
            },
            holes: Number,
            pars: []
        }
    ]
});
exports.default = mongoose_1.default.model('Course', skeema);
