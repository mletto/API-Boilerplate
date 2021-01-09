import Controller from  'modules/core/base/base.controller';
import { OrganizationDto } from './organization.dto';
import organizationsModel from './organization.model';
import OrganizationService from './organization.service';

const _organizationService = new OrganizationService(organizationsModel);
const path = '/organization'

class OrganizationController extends Controller {
    
    constructor() {
        super(_organizationService, path, OrganizationDto);
        this.initializeRoutes();
        this.initializeCoreRoutes();
        this.printRoutes()
    }

    private initializeRoutes(){
    }

}

export default OrganizationController;