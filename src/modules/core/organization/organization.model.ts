import {Schema, model} from 'mongoose';
import {historyPlugin} from 'utils/mongoose-history-plugin/history.plugin'
import {softdeletePlugin} from 'utils/mongoose-softdelete-plugin/softdelete.plugin'
import HttpException from "exceptions/HttpExceptionn";
import { IOrganizationDocument } from './organization.interface';
import userModel from '../user/user.model';
import NoAdminException from 'exceptions/NoAdminException';


const OrganizationSchema = new Schema(
      {
        name: { type: String, required: true, unique: true},
        logo: {type: String, default: ''},
        active: { type: Boolean, default:true},
      }
    );


/********************************************************************************
** Middlewares 
********************************************************************************/

    // Prevent role & verifications
    OrganizationSchema.pre<IOrganizationDocument>('save', async function (next) {

        if ( this.isModified('active')){
          return userModel.findById(this.__user)
            .then( user =>{
              user.role === 'admin' ? next() : next(new NoAdminException())
            })
          }
           
    })

    // Custom Duplicate  message  
    
    OrganizationSchema.post('save', function(error: any, doc: IOrganizationDocument, next: Function) {
      if (error.name === 'MongoError' && error.code === 11000) {
        next(new HttpException(401, 'Organization Error', `La organización con nombre ${doc.name} existe`));
      } else {
        next(error);
      }
    });

    OrganizationSchema.plugin(historyPlugin);
    OrganizationSchema.plugin(softdeletePlugin);

  export default model<IOrganizationDocument>("Organization", OrganizationSchema)
