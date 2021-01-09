import * as mongoose from 'mongoose';
import { IHistoryDocument } from 'utils/mongoose-history-plugin/history.interface';
import { ISoftDeletedDocument } from 'utils/mongoose-softdelete-plugin/softdelete.interface';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  validationCode: number;
  phoneVerified: boolean;
  password: string;
  avatar?: string;
  active?: boolean;
  accountType?: string;
  organization?: string;
  role: string;
  loginMethod: string;
  accounts: string[];
  permission: [
    {
        type: string;
        read: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
        admin: boolean;
    }
]
}

export interface IUserDocument extends mongoose.Document, IUser, IHistoryDocument, ISoftDeletedDocument {
  fullName: string
  __auth: string
  validatePassword(password: string): Promise<boolean>
  validateAdmin(id: string): Promise<boolean>
}

export interface CodeValidation {
  id: string;
  code: number
}
