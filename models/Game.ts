import mongoose from 'mongoose';

const skeema = new mongoose.Schema({
    date: Date,
    course: String,
    layout: String,
    pars: [Number],
    holes: Number,
    scorecards: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            },
            scores: [],
            _id: false,
        }
    ],
    isOpen: Boolean,
})

export default mongoose.model('Game', skeema);