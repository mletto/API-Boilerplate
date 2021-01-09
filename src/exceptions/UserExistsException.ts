import HttpException from "./HttpExceptionn";

class UserExistsException extends HttpException {
  constructor(email: string) {
    super(401, 'User Error', `El usuario con email ${email} existe`);
  }
}

export default UserExistsException;
