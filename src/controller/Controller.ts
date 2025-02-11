import {Document} from "mongodb";
import {Request, Response, NextFunction} from "express";

import BaseController, {RequestSchema} from "./BaseController";
import ControllerService from "../service/ControllerService";

export default class Controller<CS extends ControllerService = ControllerService> extends BaseController
{
    public controllerService: CS;

    public constructor (controllerService: CS)
    {
        super();

        this.controllerService = controllerService;
    }

    public async read (request: Request, response: Response, next: NextFunction, requestSchema?: RequestSchema): Promise<void>
    {
        try
        {
            Controller.parseRequest(request, response, requestSchema);

            const {query, options} = response.locals.parsed.body;
            const {documents, count} = await this.controllerService.read(query, options);

            await this.sendResponse(request, response, 200, {documents, count});
        }
        catch (error)
        {
            this.sendResponseWhenError(response, error);
        }
    }

    public async readOneById (request: Request, response: Response, next: NextFunction, requestSchema?: RequestSchema): Promise<void>
    {
        try
        {
            Controller.parseRequest(request, response, requestSchema);

            const {_id} = response.locals.parsed.body;
            const document: Document | null = await this.controllerService.readOneById(_id);

            await this.sendResponse(request, response, 200, {document});
        }
        catch (error)
        {
            this.sendResponseWhenError(response, error);
        }
    }

    public async createOne (request: Request, response: Response, next: NextFunction, requestSchema?: RequestSchema): Promise<void>
    {
        try
        {
            Controller.parseRequest(request, response, requestSchema);

            const {documentData} = response.locals.parsed.body;
            const document: Document = await this.controllerService.createOne(documentData);

            await this.sendResponse(request, response, 200, {document});
        }
        catch (error)
        {
            this.sendResponseWhenError(response, error);
        }
    }

    public async updateOneByIdAndVersion (request: Request, response: Response, next: NextFunction, requestSchema?: RequestSchema): Promise<void>
    {
        try
        {
            Controller.parseRequest(request, response, requestSchema);

            const {_id, version, documentData} = response.locals.parsed.body;
            const document: Document | null = await this.controllerService.updateOneByIdAndVersion(_id, version, documentData);

            await this.sendResponse(request, response, 200, {document});
        }
        catch (error)
        {
            this.sendResponseWhenError(response, error);
        }
    }

    public async softDeleteOneByIdAndVersion (request: Request, response: Response, next: NextFunction, requestSchema?: RequestSchema): Promise<void>
    {
        try
        {
            Controller.parseRequest(request, response, requestSchema);

            const {_id, version} = response.locals.parsed.body;
            const document: Document | null = await this.controllerService.softDeleteOneByIdAndVersion(_id, version);

            await this.sendResponse(request, response, 200, {document});
        }
        catch (error)
        {
            this.sendResponseWhenError(response, error);
        }
    }

    public async deleteOneByIdAndVersion (request: Request, response: Response, next: NextFunction, requestSchema?: RequestSchema): Promise<void>
    {
        try
        {
            Controller.parseRequest(request, response, requestSchema);

            const {_id, version} = response.locals.parsed.body;
            const document: Document | null = await this.controllerService.deleteOneByIdAndVersion(_id, version);

            await this.sendResponse(request, response, 200, {document});
        }
        catch (error)
        {
            this.sendResponseWhenError(response, error);
        }
    }
}
