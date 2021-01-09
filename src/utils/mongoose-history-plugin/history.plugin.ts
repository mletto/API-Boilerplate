import * as mongoose from 'mongoose'
import { IHistoryDocument } from './history.interface';
import historyModel from './historyModel';
const jsondiffpatch = require('jsondiffpatch').create();

export const historyPlugin = (schema: mongoose.Schema<any> )=>{

    schema.pre<IHistoryDocument>('save', function (next) {
        if(this.isNew){
            return saveObject(
                this,
                this.toObject({ depopulate: true }),
                null
            );
        } else {
            this.collection
            .findOne({ _id: this._id })
            .then(original => {
                return saveObject(
                    this,
                    original,
                    this.toObject({ depopulate: true }),
                );
            })
            .then(() => next())
            .catch(next);
        }
    });

    schema.pre<IHistoryDocument>('remove', function (next) {
            this.collection
            .findOne({ _id: this._id })
            .then(original => {
                return saveObject(
                    this,
                    null,
                    null,
                    this.toObject({ depopulate: true })
                );
            })
            .then(() => next())
            .catch(next);
        
    });

    schema.methods.getHistories = function() {
        return new Promise((resolve, reject) => {
          historyModel.find({collectionId: this._id}, (error: any, docs: IHistoryDocument[]) => {
            if(error) {
              console.error(error)
              return reject(error)
            }
            resolve(docs)
          })
        })
      }

}

 const saveObject = (currentObject: any, original: any, updated?: any, deleted?: any)=> {

    let diff: any = undefined;

    if(currentObject.__reason !== 'Login'){
        const data = {
            originalVersion: original,
            diff,
            deletedVersion: deleted
        }
        if (updated){
            data.diff = jsondiffpatch.diff(
                JSON.parse(JSON.stringify(original)),
                JSON.parse(JSON.stringify(updated))
                );
                delete data.originalVersion
        } else if (deleted){
            delete data.originalVersion
            delete data.diff
        } else {
            delete data.diff
            delete data.deletedVersion
        }
    }
        
        const collectionId = currentObject._id;
        const collectionName = currentObject.model.modelName;
        const user = currentObject.__user || undefined;
        const reason = currentObject.__reason || undefined;
        
        return historyModel.findOne({ collectionId, collectionName })
        .sort('-version')
        .then(lastHistory => {
            const history = new historyModel({
                collectionId,
                collectionName,
                user,
                reason,
 
            });

            return history.save();
        });
}
