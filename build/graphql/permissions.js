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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_shield_1 = require("graphql-shield");
const isLoggedIn = (0, graphql_shield_1.rule)({ cache: 'contextual', })((parent, args, context, info) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return !!((_a = context.user) === null || _a === void 0 ? void 0 : _a.id);
}));
exports.default = (0, graphql_shield_1.shield)({
    Query: {
        "*": isLoggedIn,
        getMe: graphql_shield_1.allow,
    },
    Mutation: {
        "*": isLoggedIn,
        login: graphql_shield_1.allow,
    }
});
