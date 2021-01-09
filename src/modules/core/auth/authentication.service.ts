import * as bcrypt from 'bcrypt';
import HttpException from 'exceptions/HttpExceptionn';
import historyModel from 'utils/mongoose-history-plugin/historyModel';
import {LoginDto} from './authentication.dto';
import { GoogleTokens, RequestWithUser } from './authentication.interface';
import axios from "axios"
import { TokenPayload } from 'google-auth-library';


const createToken = require('utils/createToken');

class AuthenticationService {

  constructor(private model: any) {
    this.model = model
  }

  async emailLogin(data: LoginDto) {
    try {
      let user = await this.model.findOne({ email: data.email })
      if (user) {
        if(user.loginMethod === 'google'){
          return new HttpException(401,'Authentication Error',  `El usuario con email ${data.email} debe iniciar sesión en google`);
        } else {
            const isPasswordMatching = await bcrypt.compare(
                data.password,
                user.get('password', null, { getters: false }),
            );
            if (isPasswordMatching) {
                const tokenData = createToken(user);
                
                const history = new historyModel({
                  collectionId : user._id,
                  reason : 'Login'
   
                });
                history.save();

                return {
                  error: false,
                  statusCode: 202,
                  user,
                  tokenData
                };

            } else {
            return new HttpException(401, 'Authentication Error',  'La contraseña es incorrecta');
            }
        } 
      } else {
        return new HttpException(401, 'Authentication Error',  `El usuario con email ${data.email} no existe`);
      }
    } catch (errors) {
      return new HttpException(500, 'Authentication Error', errors.errmsg || "Se produjo un error")
    }
  }
  async googleLogin(tokens: GoogleTokens) {
      return this.getGoogleUser(tokens)
      .then( async (payload: TokenPayload) => {
        try {
          let user = await this.model.findOne({ email: payload.email })
          if (user) {
            if(user.loginMethod === 'email'){
              return new HttpException(401,'Authentication Error',  `El usuario con email ${payload.email} debe iniciar sesión con email/password`);
            } else {
                
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
    
            } 
          } else {
            return new HttpException(401, 'Authentication Error',  `El usuario con email ${payload.email} no existe`);
          }
        } catch (errors) {
          return new HttpException(500, 'Authentication Error', errors.errmsg || "Se produjo un error")
        }
      })

  }
  async logout(req: RequestWithUser) {

    const history = new historyModel({
      collectionId : req.user._id,
      reason : 'Logout'

    });
    history.save();

    return {
      error: false,
      statusCode: 202
    };

  }

  /********************************************************************************
  ** Helpers 
  ********************************************************************************/


  public async getGoogleUser(tokens: GoogleTokens) {
          
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

  

}

export default AuthenticationService;
