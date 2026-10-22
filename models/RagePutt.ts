import mongoose from 'mongoose';

export type RagePuttScorecard = {
    user: mongoose.Types.ObjectId,
    scores: number[]
}

export type RagePuttGame = {
    mode: string,
    startTime: Date,
    endTime?: Date,
    scorecards: RagePuttScorecard[]
}

const exposePlainId = (_document: mongoose.Document, returnedObject: Record<string, unknown>) => {
    returnedObject.id = String(returnedObject._id);
    delete returnedObject._id;
    delete returnedObject.__v;
    return returnedObject;
};

const scorecard = new mongoose.Schema<RagePuttScorecard>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    scores: [Number]
}, {
    toJSON: { transform: exposePlainId }
});

const scheme = new mongoose.Schema<RagePuttGame>({
    mode: {
        type: String,
        default: 'default',
    },
    startTime: Date,
    endTime: Date,
    scorecards: [scorecard]
}, {
    toJSON: { transform: exposePlainId }
});

export default mongoose.model<RagePuttGame, mongoose.Model<RagePuttGame>>('RagePutt', scheme);