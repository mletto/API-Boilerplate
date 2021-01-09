
import { NextFunction, Request, Response, Router } from "express";
import {GoogleTokensDto, LoginDto} from "modules/core/auth/authentication.dto";
import AuthenticationMiddleware from "middleware/authentication.middleware";
import validationMiddleware from "middleware/validation.middleware";
import AuthenticationService from "modules/core/auth/authentication.service"
import userModel from "modules/core/user/user.model";
import { RequestWithUser } from "./authentication.interface";
import Controller from "modules/core/base/base.controller";


const createToken = require('utils/createToken');

const model =  userModel
const _authenticationService = new AuthenticationService(model);
const path = '/auth'

export class AuthenticationController extends Controller {

    constructor(){
        super(_authenticationService, path, null);
        this.initializeRoutes();
        this.printRoutes()
    }

    private initializeRoutes(){
        
        // Email Login
        this.router.post(`${this.path}/login`, validationMiddleware(LoginDto), this.emailLogin);

        // Google Login
        this.router.post(`${this.path}/google`,validationMiddleware(GoogleTokensDto), this.googleLogin);

        // Logout
        this.router.post(`${this.path}/logout`,AuthenticationMiddleware, this.logout);

        // Refresh Token
        this.router.get(`${this.path}/refreshToken`, AuthenticationMiddleware, this.refreshToken);
       
        
    }

    async emailLogin (req: Request, res: Response) {
        let response = await _authenticationService.emailLogin(req.body);
        if (response && response.error === true) return res.status(response.statusCode).send(response);
        return res.status(202).send(response);
      }

    async googleLogin (req: Request, res: Response, next: NextFunction) {
        let response = await _authenticationService.googleLogin(req.body);
        if (response && response.error === true) return res.status(response.statusCode).send(response);
        return res.status(202).send(response);
      }

    async logout (req: RequestWithUser, res: Response) {
        let response = await _authenticationService.logout(req);
        if (response && response.error === true) return res.status(response.statusCode).send(response);
        return res.status(202).send(response);
      }
   
    async refreshToken (req: RequestWithUser, res: Response, next: NextFunction){
        let user = req.user;
        let tokenData = createToken(user);
        return res.status(202).send({user, tokenData});

    }

}