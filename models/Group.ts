import mongoose, { Model } from 'mongoose';
import validator from 'mongoose-unique-validator';
import makeId from '../utils/makeId';
import { Group } from '../types/Group';
import { ID } from '../types';

export type GroupDocument = Group & Document

export type GroupModel = Model<GroupDocument> & {
    createGroup: (name: string, creatorId: ID) => Promise<GroupDocument>
}

const schema = new mongoose.Schema<Group>({
    name: String,
    users: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    inviteCode: {
        type: String,
        unique: true
    },
    closed: {
        type: Boolean,
        default: false,
    },
    games: [{
        type: mongoose.Types.ObjectId,
        ref: 'Game',
        default: []
    }]
});

schema.plugin(validator);


schema.statics.createGroup = async function(name: string, creatorId: ID) {
    let attempts = 0;
    while (attempts < 100) {
        try {
            const newGroup = await this.create({
                name,
                inviteCode: makeId(6),
                owner: creatorId,
                users: [creatorId]
            });
            return newGroup;
        } catch (e) {
            attempts++;
        }
    }

    throw new Error('Tried to create a group 100 times but failed.');
};

export default mongoose.model<GroupDocument, GroupModel>('Group', schema);