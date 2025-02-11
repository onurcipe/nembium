import {IncomingHttpHeaders} from "node:http";

import {Request, Response, Router, RouterOptions} from "express";
import {ParamsDictionary} from "express-serve-static-core";
import {ParsedQs} from "qs";
import {MongoError, ObjectId} from "mongodb";
import _ from "lodash";

import {isExist, isInitialized, initialize} from "../utility/value";
import {toBoolean} from "../utility/boolean";
import {isValidNumber, toNumber} from "../utility/number";
import {toString} from "../utility/string";
import {isValidDate, toDate} from "../utility/date";
import {isObjectId, toObjectId} from "../utility/object-id";
import DeveloperError from "../error/developer/DeveloperError";
import DbError from "../error/db/DbError";
import HttpError from "../error/http/HttpError";
import BadRequestError from "../error/http/client/bad-request/BadRequestError";
import ForbiddenError from "../error/http/client/forbidden/ForbiddenError";
import NotFoundError from "../error/http/client/not-found/NotFoundError";
import InternalServerError from "../error/http/server/internal/InternalServerError";

/* Request Elements */
export type Headers = IncomingHttpHeaders
export type PathParameters = ParamsDictionary
export type QueryString = ParsedQs
export type Body = any

export type RequestElementName = "headers" | "path_parameters" | "query_string" | "body"
export type RequestElement = Headers | PathParameters | QueryString | Body

/* Data Types */
export type DataTypeNull = null;
export type DataTypePrimitive = "Boolean" | "Number" | "String" | "ObjectId" | "Date";
export type DataTypeAny = "*";

export type DataType =
    | DataTypeNull
    | DataTypePrimitive
    | DataTypeObject
    | DataTypeArray
    | DataTypeAny;

export type DataTypeObject = {[property: string]: DataType}
export type DataTypeArray = DataType[]

export type ExpectedDataType = "DataTypeNull" | "DataTypePrimitive" | "DataTypeObject" | "DataTypeArray" | "DataTypeAny";
export type SentDataType = "object" | "array" | "plain";

/* Schemas */
export type Presence = "allowed-required" | "allowed-optional" | "forbidden"
export type Definition = DataType

/*
 * When `presence` is:
 *   `allowed-required` -> `allowedProperties` is required.
 *   `allowed-optional` -> `allowedProperties` is required and checked if request element is sent.
 *   `forbidden`        -> `allowedProperties` is ignored.
 */
export type RequestElementSchema =
    {
        presence: Presence;
        definition: Definition;
    }

export type RequestSchema =
    {
        headers: RequestElementSchema;
        pathParameters: RequestElementSchema;
        queryString: RequestElementSchema;
        body: RequestElementSchema;
    }

export default class BaseController
{
    protected constructor () {}

    protected static parseRequest (request: Request, response: Response, requestSchema: RequestSchema): void
    {
        const headers: any = BaseController.parseRequestElement("headers", request.headers, requestSchema.headers);
        const pathParameters: any = BaseController.parseRequestElement("path_parameters", request.params, requestSchema.pathParameters);
        const queryString: any = BaseController.parseRequestElement("query_string", request.query, requestSchema.queryString);
        const body: any = BaseController.parseRequestElement("body", request.body, requestSchema.body);

        response.locals.parsed = {
            headers,
            pathParameters,
            queryString,
            body
        };
    }

    protected static parseRequestElement (requestElementName: RequestElementName, requestElement: RequestElement, requestElementSchema: RequestElementSchema): any
    {
        const isSent: boolean = isInitialized(requestElement);

        switch (requestElementSchema.presence)
        {
            case "allowed-required":
            {
                if (!isSent)
                {
                    const errorData = {
                        headers: {code: "HEADERS_MISSING", message: "Headers are required but missing."},
                        path_parameters: {code: "PATH_PARAMETERS_MISSING", message: "Path parameters are required but missing."},
                        query_string: {code: "QUERY_STRING_MISSING", message: "Query string parameters are required but missing."},
                        body: {code: "BODY_MISSING", message: "Request body is required but missing."}
                    };

                    throw new BadRequestError(errorData[requestElementName].code, errorData[requestElementName].message);
                }

                return BaseController.parse(requestElement, requestElementSchema.presence, requestElementSchema.definition);
            }
            case "allowed-optional":
            {
                if (isSent && isExist(requestElementSchema.definition))
                {
                    return BaseController.parse(requestElement, requestElementSchema.presence, requestElementSchema.definition);
                }

                break;
            }
            case "forbidden":
            {
                if (isSent)
                {
                    const errorData = {
                        headers: {code: "HEADERS_FORBIDDEN", message: "Headers are forbidden but sent."},
                        path_parameters: {code: "PATH_PARAMETERS_FORBIDDEN", message: "Path parameters are forbidden but sent."},
                        query_string: {code: "QUERY_STRING_FORBIDDEN", message: "Query string parameters are forbidden but sent."},
                        body: {code: "BODY_FORBIDDEN", message: "Request body is forbidden but sent."}
                    };

                    throw new ForbiddenError(errorData[requestElementName].code, errorData[requestElementName].message);
                }

                break;
            }
        }
    }

    private static parse (sentValue: any, presence: Presence, definition: Definition): any
    {
        const sentDataType: SentDataType = BaseController.getSentDataType(sentValue);
        const expectedDataType: ExpectedDataType = BaseController.getExpectedDataType(definition);

        switch (expectedDataType)
        {
            case "DataTypeNull":
            {
                if (sentDataType !== "plain")
                {
                    throw new BadRequestError();
                }

                if (sentValue === null || sentValue === "null")
                {
                    return null;
                }
                else
                {
                    throw new BadRequestError();
                }
            }
            case "DataTypePrimitive":
            {
                if (sentDataType !== "plain")
                {
                    throw new BadRequestError();
                }

                switch (definition)
                {
                    case "Boolean":
                    {
                        const parsedValue: boolean | null = toBoolean(sentValue);

                        if (_.isBoolean(parsedValue))
                        {
                            return parsedValue;
                        }
                        else
                        {
                            throw new BadRequestError();
                        }
                    }
                    case "Number":
                    {
                        const parsedValue: number | null = toNumber(sentValue);

                        if (isValidNumber(parsedValue))
                        {
                            return parsedValue;
                        }
                        else
                        {
                            throw new BadRequestError();
                        }
                    }
                    case "String":
                    {
                        const parsedValue: string | null = toString(sentValue);

                        if (_.isString(parsedValue))
                        {
                            return parsedValue;
                        }
                        else
                        {
                            throw new BadRequestError();
                        }
                    }
                    case "ObjectId":
                    {
                        const parsedValue: ObjectId | null = toObjectId(sentValue);

                        if (isObjectId(parsedValue))
                        {
                            return parsedValue;
                        }
                        else
                        {
                            throw new BadRequestError();
                        }
                    }
                    case "Date":
                    {
                        const parsedValue: Date | null = toDate(sentValue);

                        if (isValidDate(parsedValue))
                        {
                            return parsedValue;
                        }
                        else
                        {
                            throw new BadRequestError();
                        }
                    }
                    default:
                    {
                        throw new DeveloperError("INVALID_REQUEST_ELEMENT_SCHEMA_DEFINITION", "The request element schema definition is invalid. Please check your data types.");
                    }
                }
            }
            case "DataTypeObject":
            {
                if (sentDataType !== "object")
                {
                    throw new BadRequestError();
                }

                return this.parseObjectDeep(sentValue, presence, definition as DataTypeObject);
            }
            case "DataTypeArray":
            {
                if (sentDataType !== "array")
                {
                    throw new BadRequestError();
                }

                return this.parseArrayDeep(sentValue, presence, definition as DataTypeArray);
            }
            case "DataTypeAny":
            {
                return sentValue;
            }
        }
    }

    private static parseObjectDeep (object: {[property: string]: any}, presence: Presence, definition: DataTypeObject): {[property: string]: any}
    {
        if (!isExist(object))
        {
            throw new BadRequestError();
        }

        const parsedObject: {[property: string]: any} = {};

        const allowedProperties: string[] = Object.keys(definition);

        for (const property in object)
        {
            const index: number = BaseController.getAllowedPropertyIndex(property, allowedProperties);

            if (index === -1)
            {
                if (presence === "allowed-optional")
                {
                    continue;
                }

                throw new ForbiddenError();
            }

            const isOptional: boolean = allowedProperties[index].startsWith(".");
            allowedProperties.splice(index, 1);

            if (isOptional && object[property] === null)
            {
                parsedObject[property] = null;
            }
            else
            {
                parsedObject[property] = this.parse(object[property], presence, definition[this.getDefinitionPropertyName(property, definition)]);
            }
        }

        for (const allowedProperty of allowedProperties)
        {
            if (allowedProperty.startsWith("."))
            {
                continue;
            }

            throw new BadRequestError("INVALID_REQUEST", "The required parameter $0 was not sent.", allowedProperty);
        }

        return parsedObject;
    }

    private static parseArrayDeep (array: any[], presence: Presence, definition: DataTypeArray): {[property: string]: any}
    {
        if (!isExist(array))
        {
            throw new BadRequestError();
        }

        const parsedArray: any[] = [];

        for (let i: number = 0; i < array.length; i++)
        {
            parsedArray.push(this.parse(array[i], presence, definition[0]));
        }

        return parsedArray;
    }

    private static getExpectedDataType (definition: Definition): ExpectedDataType
    {
        if (definition === null)
        {
            return "DataTypeNull";
        }
        else if (_.isString(definition))
        {
            return definition === "*" ? "DataTypeAny" : "DataTypePrimitive";
        }
        else if (_.isPlainObject(definition))
        {
            return "DataTypeObject";
        }
        else if (_.isArray(definition))
        {
            return "DataTypeArray";
        }
        else
        {
            throw new DeveloperError("INVALID_REQUEST_ELEMENT_SCHEMA_DEFINITION", "The request element schema definition is invalid. Please check your data types.");
        }
    }

    private static getSentDataType (sentValue: any): SentDataType
    {
        if (_.isPlainObject(sentValue))
        {
            return "object";
        }
        else if (_.isArray(sentValue))
        {
            return "array";
        }
        else
        {
            return "plain";
        }
    }

    private static getAllowedPropertyIndex (property: string, allowedProperties: string[]): number
    {
        // Required
        const requiredIndex: number = allowedProperties.indexOf(property);

        if (requiredIndex !== -1)
        {
            return requiredIndex;
        }

        // Optional
        const optionalIndex: number = allowedProperties.indexOf(`.${property}`);

        if (optionalIndex !== -1)
        {
            return optionalIndex;
        }

        // Not Found
        return -1;
    }

    private static getDefinitionPropertyName (property: string, definition: DataTypeObject): string
    {
        const properties: string[] = Object.keys(definition);

        // Required
        const requiredIndex: number = properties.indexOf(property);

        if (requiredIndex !== -1)
        {
            return properties[requiredIndex];
        }

        // Optional
        const optionalIndex: number = properties.indexOf(`.${property}`);

        if (optionalIndex !== -1)
        {
            return properties[optionalIndex];
        }

        // Not Found
        throw new DeveloperError();
    }

    private toHttpError (error: any): HttpError
    {
        if (!(error instanceof DeveloperError) && !(error instanceof DbError) && !(error instanceof MongoError) && !(error instanceof HttpError))
        {
            error = new InternalServerError();
        }

        if (!(error instanceof InternalServerError))
        {
            if (error instanceof DeveloperError)
            {
                error = new InternalServerError();
            }
            else if (error instanceof DbError)
            {
                error = new NotFoundError();
            }
            else if (error instanceof MongoError)
            {
                if (error.code === 121)
                {
                    error = new BadRequestError();
                }
                else
                {
                    error = new InternalServerError();
                }
            }
        }

        return error;
    }

    protected async sendResponse (request: Request, response: Response, statusCode: number, data?: any): Promise<void>
    {
        let responseData: any = {};

        if (isExist(data))
        {
            responseData.data = data;
        }

        if (isExist(response.locals?.authorizationBundle))
        {
            if (!isExist(responseData.auth))
            {
                responseData.auth = {};
            }

            responseData.auth.token = response.locals.authorizationBundle;
        }

        if (isExist(response.locals?.publicKey))
        {
            if (!isExist(responseData.auth))
            {
                responseData.auth = {};
            }

            responseData.auth.key = response.locals.publicKey;
        }

        if (!isInitialized(responseData))
        {
            responseData = undefined;
        }

        response.status(statusCode).json(responseData);
    }

    protected sendResponseWhenError (response: Response, error: any): void
    {
        try
        {
            const httpError: HttpError = this.toHttpError(error);
            const {statusCode, code, message} = httpError;

            response.status(statusCode).json({code, message});
        }
        catch (error)
        {
            response.status(500).json();
        }
    }

    public static createRouter (options?: RouterOptions): Router
    {
        options = initialize(options, {});
        return Router(options);
    }
}
