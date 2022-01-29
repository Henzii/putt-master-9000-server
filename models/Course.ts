import mongoose from 'mongoose';

const skeema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
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

})

export default mongoose.model('Course', skeema);