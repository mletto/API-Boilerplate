import HttpException from "./HttpExceptionn";

class NoAdminException extends HttpException {
  constructor() {
    super(401, 'Permissions Error', 'No tiene permisos de administrador');
  }
}

export default NoAdminException;
