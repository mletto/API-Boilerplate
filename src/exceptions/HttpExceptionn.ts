
class BaseError {
  constructor () {
      Error.apply(this, arguments);
  }
}


class HttpException extends BaseError {
  public error = true
  constructor (public statusCode: number, public name: string, public message: string) {
      super();    
      
  }
}

export default HttpException;

