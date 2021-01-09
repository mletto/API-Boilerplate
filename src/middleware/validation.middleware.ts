import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from 'exceptions/HttpExceptionn';

function validationMiddleware<T>(type: any, skipMissingProperties = false): RequestHandler {
  return (req, res, next) => {
    validate(plainToClass(type, req.body), { skipMissingProperties })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          
          const message = errors.map((error: ValidationError) =>{
            let messageParent: any[] = [];
            let messageChildren: any[] = [];

            if (error.children.length > 0){
              const property = error.property;
              error.children.map( (error: ValidationError) =>{ 
                if(error.children.length > 0){
                  error.children.map( (error: ValidationError) =>{ 
                    messageChildren = Object.values(error.constraints )
                    messageChildren = messageChildren.map(i => ` ${property}(${i})`);
                    messageParent = messageParent.concat(messageChildren)
                  })
                } else {
                  messageChildren = Object.values(error.constraints )
                  messageChildren = messageChildren.map(i => ` ${property}(${i})`);
                  messageParent = messageParent.concat(messageChildren)
                }
              })
            }
            
            if (error.constraints){
              messageParent = Object.values(error.constraints)
            }

            return messageParent ;
          }).join(', ');
          next(new HttpException(400, 'Request Error', message));
        } else {
          next();
        }
      });
  };
}

export default validationMiddleware;
