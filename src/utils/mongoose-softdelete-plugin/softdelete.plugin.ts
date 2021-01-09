import { Schema } from "mongoose";
import { ISoftDeletedDocument } from "./softdelete.interface";

export const softdeletePlugin = (schema: Schema<ISoftDeletedDocument> )=> {
    schema.add({ deleted: Boolean });
    schema.add({ deletedAt: Date });
  
    schema.pre<ISoftDeletedDocument>('save', function (next) {
      if (!this.deleted) {
        this.deleted = false;
      }
      if (this.deleted === false){
        this.deletedAt = undefined
      }
      next();
    });
  
    schema.methods.softdelete = function () {
      return new Promise( (resolve, reject)=>{
          this.deleted = true;
          this.deletedAt = new Date()
          this.save()
          resolve(this)
      })
    }
  
    schema.methods.restore = function() {
      return new Promise( (resolve, reject)=>{
          this.deleted = false;
          this.deletedAt = undefined
          this.save()
          resolve(this)
      })
    }

    schema.query.isDeleted = function(cond: boolean) {
        return this.find({deleted: cond})
      };

  };