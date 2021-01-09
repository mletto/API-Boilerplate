import * as mongoose from 'mongoose'
import { IHistory } from './history.interface';
const { Schema } = mongoose;

const historySchema = new Schema(
    {
        collectionName: String,
        collectionId: Schema.Types.ObjectId,
        data: {},
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
          },
        reason: String,
        version: { type: Number, min: 0 }
    },
    {
        timestamps: true
    }
);

const historyModel = mongoose.model<IHistory & mongoose.Document>('History', historySchema);

export default historyModel;