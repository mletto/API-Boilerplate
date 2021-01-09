import {CONFIG} from "modules/core/config/config";

const nodemailer = require('nodemailer');

class EmailService {
    constructor(){}

    public send(to: string, subject: string, html: string, from: string, attachments: object[]=[]){

        const transporter = nodemailer.createTransport({
            service: 'Sendpulse',
            auth: {
                user: CONFIG.EMAIL.USER,
                pass: CONFIG.EMAIL.PASSWORD
            }
        });

        

        const message: any = {from, to, subject, html, attachments};

        transporter.sendMail(message, (err: any, info: any)=> {
           err ? err : info;
        });

        }
}

export default EmailService




