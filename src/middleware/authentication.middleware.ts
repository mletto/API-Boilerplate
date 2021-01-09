import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import {DataStoredInToken, RequestWithUser} from 'modules/core/auth/authentication.interface';

import userModel from 'modules/core/user/user.model'

import AuthenticationTokenMissingException from 'exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from 'exceptions/WrongAuthenticationTokenException';
import {CONFIG} from 'modules/core/config/config';

async function AuthenticationMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {

  const bearerHeader = request.headers['authorization'];
  const model = userModel

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    try {
      const verificationResponse = jwt.verify(token, CONFIG.JWT.SECRET) as DataStoredInToken;
      const id = verificationResponse._id;
      const user = await model.findById(id);
      if (user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default AuthenticationMiddleware;
