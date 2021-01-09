import HttpException from "exceptions/HttpExceptionn";
import { Request } from "express";
import { Document, Model, Error, Schema, Types} from "mongoose";
import SuccessfullResponse from "./base.response";
import { MongooseQueryParser } from 'utils/mongoose-query-parser';
import { RequestWithUser } from "modules/core/auth/authentication.interface";
import { ISoftDeletedDocument, ISoftDeletedDocumentQuery, ISoftDeletedQuery } from "utils/mongoose-softdelete-plugin/softdelete.interface";
import { IHistoryDocument } from "utils/mongoose-history-plugin/history.interface";

const parser = new MongooseQueryParser();

interface IExtendedDocument extends Document, IHistoryDocument, ISoftDeletedDocument {}

class Service {

    constructor(public model: Model<any>) {
        this.model = model;
        this.getAll = this.getAll.bind(this);
        this.insert = this.insert.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.restore = this.restore.bind(this);
        this.getHistories = this.getHistories.bind(this);
    }

/*
MongoDB	    URI	                Example	                Result
$eq	        key=val	            type=public	            {filter: {type: 'public'}}
$gt	        key>val	            count>5	                {filter: {count: {$gt: 5}}}
$gte	    key>=val	        rating>=9.5	            {filter: {rating: {$gte: 9.5}}}
$lt	        key<val	            createdAt<2017-10-01	{filter: {createdAt: {$lt: 2017-09-30T14:00:00.000Z}}}
$lte	    key<=val	        score<=-5	            {filter: {score: {$lte: -5}}}
$ne	        key!=val	        status!=success	        {filter: {status: {$ne: 'success'}}}
$in	        key=val1,val2	    country=GB,US	        {filter: {country: {$in: ['GB', 'US']}}}
$nin	    key!=val1,val2	    lang!=fr,en	            {filter: {lang: {$nin: ['fr', 'en']}}}
$exists	    key	                phone	                {filter: {phone: {$exists: true}}}
$exists	    !key	            !email	                {filter: {email: {$exists: false}}}
$regex	    key=/value/<opts>	email=/@gmail\.com$/i	{filter: {email: /@gmail.com$/i}}
$regex	    key!=/value/<opts>	phone!=/^06/	        {filter: {phone: { $not: /^06/}}}
*/

    getAll(query: any) {
        let {isDeleted} = query
        isDeleted ? delete query.isDeleted : isDeleted=false
        const parsed = parser.parse(query)
        return (this.model.find((parsed.filter)) as unknown as ISoftDeletedDocumentQuery)
            .isDeleted(isDeleted)
            .sort(parsed.sort)
            .limit(Number(parsed.limit) || 0 )
            .skip(Number(parsed.skip) || 0)
            .select(parsed.select)
            .sort(parsed.sort)
            .populate(parsed.populate)
            .then( (item: ISoftDeletedDocument) => new SuccessfullResponse(201, item))
            .catch( (err: Error) => new HttpException(500,'Mongoose Error', err.message)  )
    }


    
    insert(data: any, req: Request) {
        const item: IExtendedDocument = new this.model({...data})
            item.__user = item._id
            item.__reason = 'Create'
        return item.save()
            .then( (item) => new SuccessfullResponse(201, item))
            .catch( (err: Error) => new HttpException(500, 'Mongoose Error', err.message)  )
    }

    async update(id: string, data: any, req: RequestWithUser) {
         if (Types.ObjectId.isValid(id)){
            const item: IExtendedDocument = await this.model.findById(id)
                .then( item => item)
                .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
            if(item){
                item.set(data)
                item.__user = req.user._id
                item.__reason = 'Updated'
                return item.save()
                    .then( item => new SuccessfullResponse(201, item))
                    .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
            } else {
                return new HttpException(400,'Request Error', 'El _id no existe')
            }
         } else {
            return new HttpException(400,'Request Error', 'El _id no válido')
         }
    }

    async delete(id: string, req: RequestWithUser) {
        if (Types.ObjectId.isValid(id)){
           const item: IExtendedDocument = await this.model.findById(id)
               .then( item => item)
               .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
           if(item){
            item.__user = req.user._id
            item.__reason = 'Deleted'
               return item.softdelete()
               .then( item => item)
               .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
           } else {
               return new HttpException(400,'Request Error', 'El _id no existe')
           }
        } else {
           return new HttpException(400,'Request Error', 'El _id no es válido')
        }
   }

   async restore(id: string, req: RequestWithUser) {
    if (Types.ObjectId.isValid(id)){
       const item: IExtendedDocument = await this.model.findById(id)
           .then( item => item)
           .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
       if(item){
        item.__user = req.user._id
        item.__reason = 'Restored'
           return item.restore()
           .then( item => item)
           .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
       } else {
           return new HttpException(400,'Request Error', 'El _id no existe')
       }
    } else {
       return new HttpException(400,'Request Error', 'El _id no es válido')
    }
}

   async getHistories(id: string, req: RequestWithUser) {
    if (Types.ObjectId.isValid(id)){
        const item: IExtendedDocument = await this.model.findById(id)
            .then( item => item)
            .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
        if(item){
            return item.getHistories()
                .then( item => new SuccessfullResponse(201, item))
                .catch( (err: Error) => new HttpException(500,'Mongoose Error',err.message) )
        } else {
            return new HttpException(400,'Request Error', 'El _id no existe')
        }
     } else {
        return new HttpException(400,'Request Error', 'El _id no es válido')
     }
   }
}

export default Service;