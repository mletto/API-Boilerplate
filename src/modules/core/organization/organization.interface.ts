import * as mongoose from 'mongoose';
import { IHistoryDocument } from 'utils/mongoose-history-plugin/history.interface';
import { ISoftDeletedDocument } from 'utils/mongoose-softdelete-plugin/softdelete.interface';

export interface IOrganization {
  name        :   string;
  logo         :   string;
  active     :   boolean;
}

export interface IOrganizationDocument extends mongoose.Document, IOrganization, IHistoryDocument, ISoftDeletedDocument {
}

