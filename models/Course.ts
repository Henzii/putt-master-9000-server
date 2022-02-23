import mongoose from 'mongoose';
import validator from 'mongoose-unique-validator';

const skeema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        unique: true,
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
skeema.plugin(validator);

export default mongoose.model('Course', skeema);