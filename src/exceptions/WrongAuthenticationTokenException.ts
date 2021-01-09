import HttpException from "./HttpExceptionn";

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(401, 'Token Error', 'Wrong authentication token');
  }
}

export default WrongAuthenticationTokenException;
