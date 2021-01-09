import * as mongoose from 'mongoose';
import { IHistoryDocument } from 'utils/mongoose-history-plugin/history.interface';
import { ISoftDeletedDocument } from 'utils/mongoose-softdelete-plugin/softdelete.interface';

interface IJwt extends Object {
  SECRET: string,
  EXPIRES: number
}

interface IEmail extends Object {
  USER: string,
  PASSWORD: string,
}

interface IFrontend extends Object {
  LOGINURL: string
}

export interface IConfig {
  JWT: IJwt,
  EMAIL: IEmail,
  FRONTEND: IFrontend,
  RESOURCES: Array<String>
}

export interface IConfigDocument extends mongoose.Document, IConfig, IHistoryDocument, ISoftDeletedDocument {
}

