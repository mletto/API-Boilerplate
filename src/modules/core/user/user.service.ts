import Service from 'modules/core/base/base.service';
import {Types} from 'mongoose'
import HttpException from 'exceptions/HttpExceptionn';
import {CONFIG} from 'modules/core/config/config';
import { EmailDto } from 'modules/core/auth/authentication.dto';
import historyModel from 'utils/mongoose-history-plugin/historyModel';
import { IUserDocument, CodeValidation } from './user.interface';
import SuccessfullResponse from 'modules/core/base/base.response';
import { GoogleTokens } from 'modules/core/auth/authentication.interface';
import { TokenPayload } from 'google-auth-library';
import axios from "axios"
import env from 'utils/validateEnv'


const createToken = require('utils/createToken')

class UserService extends Service {
  constructor(model: any) {
    super(model);
  }

  async insertGoogleUser(tokens: GoogleTokens) {
    return this.getGoogleUser(tokens)
    .then( async (payload: TokenPayload) => {
      try {
        let user = await this.model.findOne({ email: payload.email })
        if (!user) {

          const user: IUserDocument = new this.model({
            firstName: payload.given_name,
            lastName: payload.family_name,
            email: payload.email,
            img: payload.picture,
            password: '******',
            loginMethod: 'google'
        })
            user.__user = user._id
            user.__reason = 'Create from Google'
            user.save()
            .then( (item) => new SuccessfullResponse(201, item))
            .catch( (err: Error) => new HttpException(500, 'Mongoose Error', err.message)  )
              
            const tokenData = createToken(user);
            
            const history = new historyModel({
              collectionId : user._id,
              reason : 'Google Login'
            });
            history.save();

            return {
              error: false,
              statusCode: 202,
              user,
              tokenData
            };
  
          
        } else {
          return new HttpException(401, 'Authentication Error',  `El usuario con email ${payload.email} ya existe`);
        }
      } catch (errors) {
        return new HttpException(500, 'Authentication Error', errors.errmsg || "Se produjo un error")
      }
    })

}

  async verifyPhone(data: CodeValidation) {
    if (Types.ObjectId.isValid(data.id)){
       const item: IUserDocument = await this.model.findById(data.id)
           .then( item => item)
           .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
       if (item.phone.length === 0){
          return new HttpException(400,'Request Error', 'Debe registrar un teléfono previamente')
       }    
       if(item.toObject().validationCode === data.code){
           item.set({phoneVerified: true})
           item.__user = data.id
           item.__auth = env.DB_PASSWORD
           item.__reason = 'Phone verified'
           item.validationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
           return item.save()
               .then( item => new SuccessfullResponse(201, item))
               .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
       } else {
           return new HttpException(400,'Request Error', 'Los datos validados no son correctos')
       }
    } else {
       return new HttpException(400,'Request Error', 'El _id no es válido')
    }
}

async verifyEmail(data: CodeValidation) {
  if (Types.ObjectId.isValid(data.id)){
     const item: IUserDocument = await this.model.findById(data.id)
         .then( item => item)
         .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
      if (item.email.length === 0){
          return new HttpException(400,'Request Error', 'Debe registrar un email previamente')
      } 
     if(item.toObject().validationCode === data.code){
         item.set({emailVerified: true})
         item.__user = data.id
         item.__auth = env.DB_PASSWORD
         item.__reason = 'Email verified'
         item.validationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
         return item.save()
             .then( item => new SuccessfullResponse(201, item))
             .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
     } else {
         return new HttpException(400,'Request Error', 'Los datos validados no son correctos')
     }
  } else {
     return new HttpException(400,'Request Error', 'El _id no es válido')
  }
}

  async resetPassword(email: EmailDto) {
    try {
      let user = await this.model.findOne(email)
      if (user) {
        if(user.isGoogle){
          return new HttpException(401,'User Error', `El usuario con email ${email.email} debe iniciar sesión en google`);
        } else {
          let token = createToken(user)
          let resetLink = `${CONFIG.FRONTEND.LOGINURL}/${token.token}/${user._id}`;
          let _id = user._id;

          const history = new historyModel({
            collectionId : user._id,
            reason : 'Reset Password'

          });
          history.save();

          return {
            error: false,
            statusCode: 202,
            data: {_id, resetLink}
            };
        } 
      } else {
        return new HttpException(401,'User Error', `El usuario con email ${email.email} no existe`);
      }
    } catch (errors) {
      return new HttpException(500,'User Error',`El usuario con email ${email.email} no existe`)
    }
  }

    /********************************************************************************
  ** Helpers 
  ********************************************************************************/


 private async getGoogleUser(tokens: GoogleTokens) {
          
  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.id_token}`,
        },
      },
    )
    .then((res: any) => res.data)
    .catch((error: any) => {
      throw new Error(error.message);
    });

  return googleUser;
}
};

export default UserService;