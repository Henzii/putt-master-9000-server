import mongoose from "mongoose";

const skeema = new mongoose.Schema({
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    Games: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game'
        }
    ]

})

skeema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString();
        delete returnedObj._id;
        delete returnedObj._v;
    }
})

export default mongoose.model('User', skeema);