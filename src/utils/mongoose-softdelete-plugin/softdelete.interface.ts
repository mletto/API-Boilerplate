import { Document, Model, Query, DocumentQuery } from "mongoose";

export interface ISoftDeletedDocument extends Document {
  deleted: Boolean;
  deletedAt: Date;
  softdelete(): Promise<ISoftDeletedDocument>;
  restore(): Promise<ISoftDeletedDocument>;
}

export type ISoftDeletedModel = Model<ISoftDeletedDocument>;

interface IQueryMethods {
  isDeleted: (condition: Boolean) => Query<ISoftDeletedDocument, ISoftDeletedDocument, ISoftDeletedDocument>;
}

export type ISoftDeletedQuery = Query<ISoftDeletedDocument, ISoftDeletedDocument, ISoftDeletedDocument> & IQueryMethods;
export type ISoftDeletedDocumentQuery = DocumentQuery<ISoftDeletedDocument[],ISoftDeletedDocument> & IQueryMethods;
