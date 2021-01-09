import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import HttpException from 'exceptions/HttpExceptionn';
import {Controller} from 'modules/core/base/base.interface';
import 'utils/string.extensions'
import errorMiddleware from 'middleware/error.middleware';
import firstConnection from 'utils/firstConnection';
import env from 'utils/validateEnv'
import ConfigMiddleware from 'middleware/config.middleware';

export class App {

    public app: express.Application;

    constructor(private controllers: Controller[])
    {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeControllers(this.controllers);
        this.connectToTheDatabase();
        this.initializeErrorHandling();
    }

    public listen() {
        this.app.listen(env.SERVER_PORT, () => {
          const serverType = env.isProduction ? 'production' : 'dev'
          console.log(`Server (${serverType}) listening on the port ${env.SERVER_PORT}`);
        });
      }
    
    public getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());        
        
        const options: cors.CorsOptions = {
          allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'X-Access-Token',
            'Authorization'
          ],
          credentials: true,
          methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
          origin: '*',
          preflightContinue: false,
        };
    
        this.app.use(cors(options));

        this.app.use(ConfigMiddleware)

    }

    private initializeControllers(controllers: Controller[]) {
      controllers.forEach((controller) => {
        this.app.use('/', controller.router);
      });
    }
    
    private initializeErrorHandling() {
      this.app.use(errorMiddleware)
      
    }

    private connectToTheDatabase() {
      mongoose.set('useNewUrlParser', true);
      mongoose.set('useFindAndModify', false);
      mongoose.set('useCreateIndex', true);
      mongoose.set('useUnifiedTopology', true);
      
      if(!env.DB_HOST.isEmpty() && !env.DB_PASSWORD.isEmpty() && !env.DB_USER.isEmpty() && !env.DB_DATABASE.isEmpty()){
        const connectionString = `mongodb://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT || 27017 }/${env.DB_DATABASE}` 
        mongoose.connect(connectionString)
        .then( ()=>{
          console.log(`DB Server Connected!`);
          new firstConnection()

        })
        .catch( err =>{
          throw new HttpException(500, 'Mongoose Error', `Database Error: ${err}`)
        })
      } else {
        console.log(`DB Server Not Connected. Please provide DB Config properties`);
      }
  
    }

    

   
  
    

} 