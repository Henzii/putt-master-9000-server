import mongoose from 'mongoose';

const skeema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 30,
        required: true,
    },
    date: String,
    course: String,
    layout: String,
    comment: {
        type: String,
        maxlength: 200,
    },
    invites: {
        invited: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        rejected: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        accepted: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    },
    registrationOpen: Boolean,
    messages: [
        {
            message: String,
            user: { type: mongoose.Types.ObjectId, ref: 'User' }
        }
    ],
    creator: { type: mongoose.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Event', skeema);
