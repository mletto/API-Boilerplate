import { NextFunction, Request, Response } from 'express';
import UserService from './user.service';
import Controller from  'modules/core/base/base.controller';
import validationMiddleware from 'middleware/validation.middleware';
import {UserDto, EmailDto} from './user.dto';
import { RequestWithUser } from 'modules/core/auth/authentication.interface';
import EmailService from 'utils/email.service';
import userModel from './user.model';
import AuthenticationMiddleware from 'middleware/authentication.middleware';
import AutorizationMiddleware from 'middleware/authorization.middleware';
import adminOrSameUserMiddleware from 'middleware/adminOrSameUser.middleware';

const _userService = new UserService(userModel);
const path = '/user'

class UserController extends Controller {
    
    constructor() {
        super(_userService, path, UserDto);
        this.initializeRoutes();
        this.initializeCoreRoutes()
        this.printRoutes()

    }

    private initializeRoutes(){

        // User Registrstion Email
        this.router.post(`${this.path}`,[validationMiddleware(UserDto)], this.insert)

        // User Registrstion Google
        this.router.post(`${this.path}/google`,[validationMiddleware(UserDto)], this.insertGoogleUser)

        // User Update Same User or Admin restriction
        this.router.patch(`${this.path}/:id`,[AuthenticationMiddleware, adminOrSameUserMiddleware, AutorizationMiddleware(this.path,'update'), validationMiddleware(UserDto,true)], this.update);
  
        // Verify Email
        this.router.post(`${path}/verifyEmail`, this.verifyEmail);

        // Verify Phone
        this.router.post(`${path}/verifyPhone`, this.verifyPhone);

        // Password Reset
        this.router.post(`${path}/passwordRequest`, validationMiddleware(EmailDto), this.passwordRequest);

    }

    async insertGoogleUser(req: Request, res: Response) {
        let response = await _userService.insertGoogleUser(req.body);
        if (response && response.error === true) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      }

    async verifyEmail (req: Request, res: Response) {
      let response = await _userService.verifyEmail(req.body);
      if (response && response.error === true) return res.status(response.statusCode).send(response);
      return res.status(201).send(response);
    }

    async verifyPhone (req: Request, res: Response) {
      let response = await _userService.verifyPhone(req.body);
      if (response && response.error === true) return res.status(response.statusCode).send(response);
      return res.status(201).send(response);
    }

    async passwordRequest (req: RequestWithUser, res: Response, next: NextFunction) {
      let email: EmailDto = req.body;
      let response = await _userService.resetPassword(email);
      if (response && response.error){
          return res.status(response.statusCode).send(response);
      } 
      
      new EmailService().send(
          email.toString(),
          'Password Reset',
          response.toString(),
          'hola@noordica.com'
      )

      return res.status(201).send(response);

  }

}

export default UserController;