import HttpException from 'exceptions/HttpExceptionn';
import Service from 'modules/core/base/base.service';
import SuccessfullResponse from '../base/base.response';
import { CONFIG } from './config';
import { ConfigDto } from './config.dto';
import { IConfigDocument } from './config.interface';

class ConfigService extends Service {
  constructor(model: any) {
    super(model);
  }

  async getConfig() {
    return this.model.findById('CONFIG')
        .then( (config: IConfigDocument) => new SuccessfullResponse(201, config))
        .catch( (err: Error) => new HttpException(500,'Mongoose Error', err.message)  )
  }

  async updateConfig(data: ConfigDto) {
          const item: any = await this.model.findById('CONFIG')
              .then( config => config)
              .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
          if(item){
            item.set(data)
              Object.keys(item._doc).forEach((key: string)=>(CONFIG as any)[key] = item[key])
              return item.save()
                  .then( (newConfig: any) => new SuccessfullResponse(201, newConfig))
                  .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
          } else {
              return new HttpException(400,'Request Error', 'El _id no existe')
          }
  }

};

export default ConfigService;