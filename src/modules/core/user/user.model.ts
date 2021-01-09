import {Schema, Types, model} from 'mongoose';
import * as bcrypt from 'bcrypt';
import { IUserDocument } from './user.interface';
import {hashPassword} from 'utils/hashPassword'
import {historyPlugin} from 'utils/mongoose-history-plugin/history.plugin'
import {softdeletePlugin} from 'utils/mongoose-softdelete-plugin/softdelete.plugin'
import {CONFIG} from 'modules/core/config/config';
import EmailService from 'utils/email.service';
import UserExistsException from 'exceptions/UserExistsException';
import NoAdminException from 'exceptions/NoAdminException';
import env from 'utils/validateEnv'


    const permissionSchema = new Schema(
      {
        type: { type: String, default: '', required: true  },
        read: { type: Boolean, default: false, required: true  },
        create: { type: Boolean, default: false, required: true },
        update: { type: Boolean, default: false, required: true },
        delete: { type: Boolean, default: false, required: true },
        admin: { type: Boolean, default: false, required: true },
      },
      {
        toJSON: {
          virtuals: true,
          getters: true,
        },
        id: false,
        _id: false
      }
    )

    const userSchema = new Schema(
      {
        firstName: { type: String,default:'',required:true},
        lastName: { type: String,default:'',required:true},
        email:  { type: String,unique:true,required:true,index: true},
        emailVerified :{type: Boolean,default:false},
        phone:  { type: String, default:''},
        validationCode: {type: Number, get: (): undefined => undefined},
        phoneVerified :{type: Boolean,default:false},
        avatar:  { type: String,default:''},
        password: { type: String,required:true, get: (): undefined => undefined},
        active: { type: Boolean,default:true},
        accountType: { type: String, enum: ['single', 'organization'], default: 'single' },
        organization: { type:Schema.Types.ObjectId, ref: 'Organization' },
        role: { type: String, enum: ['admin', 'user'], default: 'user' },
        loginMethod: { type: String, enum: ['email', 'google'], default: 'email' },
        permission: [permissionSchema]
      },
      {
        toJSON: {
          virtuals: true,
          getters: true,
        },
        id: false
      },
      
    );

/********************************************************************************
** Virtuals 
********************************************************************************/    
    userSchema.virtual("fullName").get(function() {
      return this.firstName + ' ' + this.lastName
    })

/********************************************************************************
** Middlewares 
********************************************************************************/

    // Prevent role & verifications
    userSchema.pre<IUserDocument>('save', async function (next) {
      if(this.isNew){
        this.role = 'user'
        this.emailVerified = false
        this.phoneVerified = false
        this.validationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
      } 
      
      if(this.isNew === false){
        if ( this.isModified('role') === true
          || this.isModified('emailVerified') === true
          || this.isModified('phoneVerified') === true
          || this.isModified('validationCode') === true ){
            if (await this.validateAdmin(this.__user) === false && this.__auth !== env.DB_PASSWORD){
              next(new NoAdminException())
            }
          }
      } 
      next();
    })

    // First Connection
    userSchema.pre<IUserDocument>('save', async function (next) {
      if(this.__user === env.DB_PASSWORD){
        this.__user = undefined
        this.role = 'admin'
        this.emailVerified = true
      } 

    if(this.isNew === false && this.isModified('role') === true  && await this.validateAdmin(this.__user) === false){
        next(new NoAdminException())
      }
      next();
    })

    // Set New Document Flag
    let newDoc = false;

    userSchema.pre<IUserDocument>('save', async function (next) {
      this.isNew ? newDoc = true : newDoc = false;
      next();
    })

    // Hash passwords
    userSchema.pre<IUserDocument>('save', async function (next) {
      if(!this.isModified("password")) {
        return next();
      }
      this.password = await hashPassword(this.get('password', null, { getters: false }))
      next();
    })

    // Send Welcome Email
    userSchema.post<IUserDocument>('save', async function () {
      if(newDoc) {
        const email = this.email;
        const verifyEmailLink = `${CONFIG.FRONTEND.LOGINURL}/${this._id}`;
        new EmailService()
          .send(
            email,
            'Welcome',
            verifyEmailLink,
            'hola@noordica.com'
          )
        newDoc = false;
      }
    })

    userSchema.post('save', function(error: any, doc: IUserDocument, next: Function) {
      if (error.name === 'MongoError' && error.code === 11000) {
        next(new UserExistsException(doc.email));
      } else {
        next(error);
      }
    });

    

/********************************************************************************
** Methods 
********************************************************************************/

    userSchema.methods.validatePassword = function(data: any) {
      return new Promise( (resolve, reject)=>{
          resolve(bcrypt.compare(data, this.password))
      })
    }

    userSchema.methods.validateAdmin = function(id: any) {
      return new Promise( async (resolve, reject)=>{
        if (Types.ObjectId.isValid(id)){
          const user: any = await model('User').findById(id)
          user && user.role === 'admin' ? resolve(true) : resolve(false)
        }
      })
    }

/********************************************************************************
** Plugins 
********************************************************************************/
    userSchema.plugin(historyPlugin);
    userSchema.plugin(softdeletePlugin);

  export default model<IUserDocument>("User", userSchema)
