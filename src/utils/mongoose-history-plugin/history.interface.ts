import * as mongoose from 'mongoose'

export interface IHistory {
    collectionName: string
    collectionId: string
    data: Object
    user: string
    reason: string
    version: number
}

export interface IHistoryDocument extends mongoose.Document {
    __reason: string
    __user: string
    getHistories(): Promise<IHistoryDocument[]>
}
