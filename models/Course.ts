import mongoose from 'mongoose';
import validator from 'mongoose-unique-validator';

const skeema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        unique: true,
    },
    location: {
        type: {
            type: String,
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [0.0, 0.0]
        },
    },
    creator: mongoose.Types.ObjectId,
    layouts: [
        {
            name: {
                type: String,
                minlength: 3,
            },
            holes: Number,
            pars: [],
            names: [String],
            creator: mongoose.Types.ObjectId,
        }
    ],

}, { timestamps: true });
skeema.plugin(validator);

export default mongoose.model('Course', skeema);