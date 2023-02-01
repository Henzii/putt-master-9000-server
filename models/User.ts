import mongoose from "mongoose";
import validator from 'mongoose-unique-validator';

const skeema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    pushToken: String,
    accountType: String,
    email: String,
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    blockFriendRequests: {
        type: Boolean,
        default: false,
    },
    blockStatsSharing: {
        type: Boolean,
        default: false,
    },
    restoreCode: String,
    achievements: [{
        achievementId: String,
        layoutId: String,
    }],

}, { timestamps: true });

skeema.plugin(validator);

skeema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString();
        delete returnedObj._id;
        delete returnedObj._v;
    }
});

export default mongoose.model('User', skeema);