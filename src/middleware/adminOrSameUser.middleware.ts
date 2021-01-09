import { NextFunction, Response } from 'express';
import NoAdminException from 'exceptions/NoAdminException';
import { RequestWithUser } from 'modules/core/auth/authentication.interface';

async function adminOrSameUserMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  request.user.role === 'admin' || request.params.id.toString() === request.user._id.toString() ? next() : next(new NoAdminException())
}

export default adminOrSameUserMiddleware;
