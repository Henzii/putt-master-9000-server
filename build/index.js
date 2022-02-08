"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./graphql/index");
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Yhteys mongoDB:hen
console.log('Connecting to MongoDb...');
mongoose_1.default.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB!');
}).catch((error) => {
    console.log('\n╔═══════════════════════════════════╗\n' +
        '║ Error when connecting to MongoDb! ║\n' +
        '╚═══════════════════════════════════╝\n', error.message, '\n\n');
});
index_1.server.listen(process.env.PORT || 8080).then(({ url }) => console.log('Serveri ' + url));
