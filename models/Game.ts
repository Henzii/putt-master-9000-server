import mongoose from 'mongoose';

const skeema = new mongoose.Schema({
    date: String,
    course: String,
    layout: String,
    layout_id: mongoose.Types.ObjectId,
    startTime: Date,
    endTime: Date,
    pars: [Number],
    holes: Number,
    scorecards: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User'
            },
            scores: [],
            beers: {
                type: Number,
                default: 0,
            },
            hc: {
                type: Number,
                default: 0,
            }
        }
    ],
    isOpen: Boolean,
});

export default mongoose.model('Game', skeema);