import {Schema, Types, model} from 'mongoose';
import { IConfigDocument } from './config.interface';


const ConfigSchema = new Schema(
  {
    _id : {type: String, default: 'CONFIG'},
    JWT : {
        SECRET      :   {type: String, default: '',},
        EXPIRES     :   {type: Number, default: 3600},
    },
    EMAIL : {
        USER        :   {type: String, default: ''},
        PASSWORD    :   {type: String, default: ''}
    },
    FRONTEND : {
        LOGINURL    :   {type: String, default: ''},
    },
    RESOURCES       :   [{type: String, default: ''}]
  },
  {
    toJSON: {
      virtuals: true,
      getters: true,
    },
    id: false
  }
);

  export default model<IConfigDocument>("Config", ConfigSchema)
