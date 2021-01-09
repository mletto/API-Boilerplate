import HttpException from 'exceptions/HttpExceptionn';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'modules/core/auth/authentication.interface';
import { CONFIG } from 'modules/core/config/config';

async function ConfigMiddleware(request: RequestWithUser, response: Response, next: NextFunction) {
  let missingConfig: string[] = []
  
  if(request.url === '/config' || request.url === '/auth/login'){
    next()
  } else {
    Object.keys(CONFIG).map( (key: any) => {
      Object.keys((CONFIG as any)[key]).map( subkey =>{
        if((CONFIG as any)[key][subkey] === null){
          missingConfig.push(`${key}.${subkey}`)
        }
      })
    })
    if (missingConfig.length > 0){
      next(new HttpException(401, 'Config Error', 'Configuración pendiente: '+missingConfig))
    } else {
      next()
    }
  }

}

export default ConfigMiddleware;
