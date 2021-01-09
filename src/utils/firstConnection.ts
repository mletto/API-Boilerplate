import configModel from 'modules/core/config/config.model';
import userModel from 'modules/core/user/user.model';
import env from 'utils/validateEnv'
import {CONFIG} from 'modules/core/config/config';

class firstConnection {

    constructor(){
        this.firstUser();
        this.firstConfig();
    }

    private firstUser(){
        userModel.find({role: 'admin'})
        .then (users =>{
            if (users.length === 0){
            const admin = new userModel({
                firstName : 'System',
                lastName  : 'Administrator',
                email     : 'admin@admin.com',
                password  : '123456',
                permission: [
                    {
                        type: '*',
                        read: true,
                        create: true,
                        update: true,
                        delete: true,
                        admin: true,
                    }
                ]
            })
            admin.__user = env.DB_PASSWORD
            admin.__reason = 'Startup'
            admin.save()
                .then( ()=> console.log('Admin user created!'))
            }
        })

    }

    private firstConfig(){

        configModel.findById('CONFIG')
            .then( (item: any) =>{
                if(item){
                    delete item._doc._id
                    delete item._doc.__v
                    Object.keys(item._doc).forEach((key: string)=>(CONFIG as any)[key] = item[key])
                } else {
                    const newConfig = new configModel({
                        JWT : {
                            SECRET      :   'S3CrEt!',
                            EXPIRES     :   3600
                        },
                        EMAIL : {
                            USER        :   null,
                            PASSWORD    :   null
                        },
                        FRONTEND : {
                            LOGINURL    :   null
                        },
                        RESOURCES       :   ['user','organization','config']
                        
                    })


                    newConfig.save()
                        .then((item: any)=>{
                            console.log('New Config Generated')
                            Object.keys(item._doc).forEach((key: string)=>(CONFIG as any)[key] = item[key])
                        })
                }
            })
    }

}

export default firstConnection