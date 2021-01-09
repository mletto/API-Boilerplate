import { NextFunction, Response } from 'express';
import NoAdminException from 'exceptions/NoAdminException';
import { RequestWithUser } from 'modules/core/auth/authentication.interface';

async function adminMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {

  request.user.role === 'admin' ? next() : next(new NoAdminException())

}

export default adminMiddleware;
