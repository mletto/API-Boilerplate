import { Response } from 'express';
import AuthenticationMiddleware from 'middleware/authentication.middleware';
import AuthorizationMiddleware from 'middleware/authorization.middleware';
import validationMiddleware from 'middleware/validation.middleware';
import Controller from  'modules/core/base/base.controller';
import { RequestWithUser } from '../auth/authentication.interface';
import { ConfigDto } from './config.dto';
import configModel from './config.model';
import ConfigService from './config.service';

const _configService = new ConfigService(configModel);
const path = '/config'

class ConfigController extends Controller {
    
    constructor() {
        super(_configService, path, ConfigDto);
        this.initializeRoutes();
        this.printRoutes()
    }

    private initializeRoutes(){
        this.router.get(`${this.path}`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'admin')], this.getConfig);
        this.router.patch(`${this.path}`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'admin'), validationMiddleware(ConfigDto,true)], this.updateConfig);      
    }

    getConfig(req: RequestWithUser, res: Response) {
        _configService.getConfig()
        .then( (response: any) =>{
          if (response && response.error) return res.status(response.statusCode).send(response);
          return res.status(201).send(response);
        })
      }
    
    
    updateConfig(req: RequestWithUser, res: Response) {
    _configService.updateConfig(req.body)
    .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
    })

    }

}

export default ConfigController;