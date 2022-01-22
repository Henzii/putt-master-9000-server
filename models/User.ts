import mongoose from "mongoose";
import validator from "mongoose-unique-validator";

const skeema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    email: String,

})

skeema.plugin(validator);

export default mongoose.model('User', skeema);