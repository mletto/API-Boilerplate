import { AuthenticationController } from 'modules/core/auth/authentication.controller';
import ConfigController from 'modules/core/config/config.controller';
import OrganizationController from 'modules/core/organization/organization.controller';
import UserController from 'modules/core/user/user.controller';
import { App } from './app'


export const api = new App(
    [
        // CORE CONTROLLERS
        new ConfigController(),
        new AuthenticationController(),
        new UserController(),
        new OrganizationController(),

        // CUSTOM CONTROLLERS
        
    ]
    );

api.listen()