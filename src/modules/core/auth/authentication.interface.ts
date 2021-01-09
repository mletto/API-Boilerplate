import { Request } from 'express';
import { IUserDocument } from 'modules/core/user/user.interface';

export interface DataStoredInToken {
  _id: string;
}

export interface RequestWithUser extends Request {
  user: IUserDocument;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface GoogleTokens {
  access_token: string;
  id_token: number;
}
