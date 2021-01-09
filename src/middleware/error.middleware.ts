import { NextFunction, Request, Response } from 'express';
import HttpException from 'exceptions/HttpExceptionn';

function errorMiddleware(err: HttpException, request: Request, response: Response, next: NextFunction) {
  const statusCode = err.statusCode || 500;
  const name = err.name || 'Error';
  const message = err.message || 'Something went wrong';
  const error = true
  response
    .status(statusCode)
    .send({
      error,
      statusCode,
      name,
      message,
    });
}

export default errorMiddleware;
