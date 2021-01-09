import {Response, Router } from "express";
import AuthenticationMiddleware from "middleware/authentication.middleware";
import AuthorizationMiddleware from "middleware/authorization.middleware";
import validationMiddleware from "middleware/validation.middleware";
import { RequestWithUser } from "modules/core/auth/authentication.interface";
const Table = require('cli-table');



class Controller {
  
  public  router = Router();


    constructor(private service: any, public path: string, private dto: any ) {
      this.service = service;
      this.path = path;
      this.getAll = this.getAll.bind(this);
      this.insert = this.insert.bind(this);
      this.update = this.update.bind(this);
      this.delete = this.delete.bind(this);
      this.restore = this.restore.bind(this);
      this.getHistories = this.getHistories.bind(this);
    }

    public initializeCoreRoutes(){   
      this.router.get(`${this.path}`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'read')], this.getAll);
      this.router.post(`${this.path}`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'create'), validationMiddleware(this.dto)], this.insert)
      this.router.patch(`${this.path}/:id`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'update'), validationMiddleware(this.dto,true)], this.update);
      this.router.delete(`${this.path}/:id`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'delete')], this.delete);
      this.router.patch(`${this.path}/:id/restore`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'admin')], this.restore);
      this.router.get(`${this.path}/:id/histories`,[AuthenticationMiddleware, AuthorizationMiddleware(this.path,'admin')], this.getHistories);
    }
  
    getAll(req: RequestWithUser, res: Response) {
      this.service.getAll(req.query)
      .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      })
    }
  
    insert(req: RequestWithUser, res: Response) {
      this.service.insert(req.body, req)
      .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      })
    }
  
    update(req: RequestWithUser, res: Response) {
      const { id } = req.params;
      this.service.update(id, req.body, req)
      .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      })
  
    }
  
    delete(req: RequestWithUser, res: Response) {
      const { id } = req.params;
      this.service.delete(id, req)
      .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      })
  
    }

    getHistories(req: RequestWithUser, res: Response) {
      const { id } = req.params;
      this.service.getHistories(id, req)
      .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      })
  
    }

    restore(req: RequestWithUser, res: Response) {
      const { id } = req.params;
      this.service.restore(id, req)
      .then( (response: any) =>{
        if (response && response.error) return res.status(response.statusCode).send(response);
        return res.status(201).send(response);
      })
  
    }

    printRoutes(){
      const table = new Table({
        head: [this.path],
        colWidths: [20, 30]
      });

      this.router.stack
      .filter( (r: any) => r.route.path)
      .map((r: any) => table.push([Object.keys(r.route.methods)[0].toUpperCase(), r.route.path]))

      console.log(table.toString());
    }

  
  }
  
  export default Controller;