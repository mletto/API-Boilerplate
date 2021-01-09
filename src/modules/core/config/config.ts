import { IConfig } from "modules/core/config/config.interface"


export const CONFIG: IConfig = {
    JWT : {
        SECRET      :   '',
        EXPIRES     :   3600
    },
    EMAIL : {
        USER        :   '',
        PASSWORD    :   ''
    },
    FRONTEND : {
        LOGINURL    :   ''
    },
    RESOURCES       :   []

    
}
