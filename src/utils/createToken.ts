import {DataStoredInToken, TokenData} from "modules/core/auth/authentication.interface";
import {IUserDocument} from "modules/core/user/user.interface";
import {CONFIG} from "modules/core/config/config";
import * as jwt from 'jsonwebtoken';


 module.exports = (user: IUserDocument): TokenData => {
        const secret = CONFIG.JWT.SECRET
        const expiresIn = Number(CONFIG.JWT.EXPIRES)
        const dataStoredInToken: DataStoredInToken = {
            _id: user._id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret , { expiresIn }),
        };
}
