import HttpException from "./HttpExceptionn";

class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(401, 'Tokens Error', 'Authentication token missing');
  }
}

export default AuthenticationTokenMissingException;
