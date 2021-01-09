import HttpException from 'exceptions/HttpExceptionn';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'modules/core/auth/authentication.interface';
import organizationModel from 'modules/core/organization/organization.model';

function AuthorizationMiddleware(resource: string, action: string) {
    return async (request: RequestWithUser, response: Response, next: NextFunction )=> {

        // Active Verification
        if(request.user.active === false){
            next(new HttpException(401, 'Authorization Error', 'El usuario no se encuentra activo'))
        }

        // Organization Active Verification
        if(request.user.accountType === 'organization'){
            const organization = await organizationModel.findById(request.user.organization);
            if (organization.active === false) {
                next(new HttpException(401, 'Authorization Error', 'La organización no se encuentra activa'))
            }
        }

        // Email Validated Verification
        if(request.user.emailVerified === false){
            next(new HttpException(401, 'Authorization Error', 'El mail no ha sido verificado aún'))
        }

        // Permissions Verification
        const _resource = resource.replace('/','')
        const userResource: any = request.user.permission.find( p => p.type === _resource || '*' )
        userResource[action] === true ? next() : next(new HttpException(401, 'Authorization Error', `You have not autorization to ${action} ${_resource}`))
    }
  }

export default AuthorizationMiddleware

  