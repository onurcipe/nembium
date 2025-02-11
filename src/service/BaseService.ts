import {Int32, Double, ObjectId} from "mongodb";
import _ from "lodash";

import {isExist} from "../utility/value";
import {toBoolean} from "../utility/boolean";
import {toNumber, isValidNumber} from "../utility/number";
import {toString} from "../utility/string";
import {isValidDate, toDate} from "../utility/date";
import {isObjectId, toObjectId} from "../utility/object-id";
import BadRequestError from "../error/http/client/bad-request/BadRequestError";
import DbBsonType from "../db/DbBsonType";
import {Definition} from "../db/DbSchema";

type Layer = "DB" | "APPLICATION" | "CONTROLLER"

export default class BaseService
{
    protected static LAYER: {[layerName: string]: Layer} = {
        "DB": "DB",
        "APPLICATION": "APPLICATION",
        "CONTROLLER": "CONTROLLER"
    };

    protected readonly layer: Layer;
    protected readonly persona?: string;

    protected constructor (layer: Layer, persona?: string)
    {
        this.layer = layer;
        this.persona = persona;
    }

    protected parseBinaryData (value: any, isForceExistence?: boolean): Buffer | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        if (Buffer.isBuffer(value))
        {
            return value;
        }

        const isBase64: boolean = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{3}=|[A-Za-z0-9+\/]{2}==)?$/.test(value);

        if (isBase64)
        {
            try
            {
                value = Buffer.from(value, "base64");
            }
            catch (error)
            {
                throw new BadRequestError();
            }
        }
        else
        {
            try
            {
                value = Buffer.from(value, "utf-8");
            }
            catch (error)
            {
                throw new BadRequestError();
            }
        }

        if (!Buffer.isBuffer(value))
        {
            throw new BadRequestError();
        }

        return value;
    }

    protected parseBoolean (value: any, isForceExistence?: boolean): boolean | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        value = toBoolean(value);

        if (!_.isBoolean(value))
        {
            throw new BadRequestError();
        }

        return value;
    }

    protected parseInt (value: any, isForceExistence?: boolean): Int32 | number | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        if (value instanceof Int32)
        {
            return value;
        }

        value = toNumber(value);

        if (!isValidNumber(value))
        {
            throw new BadRequestError();
        }

        const isInteger: boolean = _.isInteger(value);

        if (!isInteger)
        {
            throw new BadRequestError();
        }

        const int32: Int32 = new Int32(value);
        const intPrimitive: number = int32.value;

        switch (this.layer)
        {
            case BaseService.LAYER.CONTROLLER:
            case BaseService.LAYER.APPLICATION:
            {
                return intPrimitive;
            }
            case BaseService.LAYER.DB:
            {
                return int32;
            }
            default:
            {
                return intPrimitive;
            }
        }
    }

    protected parseVersion (version: any, isForceExistence?: boolean): number
    {
        if (!isExist(version))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        if (_.isFinite(version))
        {
            const isNonNegative: boolean = version >= 0;
            const isInteger: boolean = _.isInteger(version);

            if (!isNonNegative || !isInteger)
            {
                throw new BadRequestError();
            }

            return version;
        }

        if (_.isString(version))
        {
            version = _.toNumber(version);
        }

        if (!_.isFinite(version))
        {
            throw new BadRequestError();
        }

        const isNonNegative: boolean = version >= 0;
        const isInteger: boolean = _.isInteger(version);

        if (!isNonNegative || !isInteger)
        {
            throw new BadRequestError();
        }

        return version;
    }

    protected parseDouble (value: any, isForceExistence?: boolean): Double | number | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        if (value instanceof Double)
        {
            return value;
        }

        value = toNumber(value);

        if (!isValidNumber(value))
        {
            throw new BadRequestError();
        }

        const double: Double = new Double(value);
        const doublePrimitive: number = double.value;

        switch (this.layer)
        {
            case BaseService.LAYER.CONTROLLER:
            case BaseService.LAYER.APPLICATION:
            {
                return doublePrimitive;
            }
            case BaseService.LAYER.DB:
            {
                return double;
            }
            default:
            {
                return doublePrimitive;
            }
        }
    }

    protected parseString (value: any, isForceExistence?: boolean): string | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        value = toString(value);

        if (!_.isString(value))
        {
            throw new BadRequestError();
        }

        return value;
    }

    protected parseDate (value: any, isForceExistence?: boolean): Date | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        value = toDate(value);

        if (!isValidDate(value))
        {
            throw new BadRequestError();
        }

        return value;
    }

    protected parseObjectId (value: any, isForceExistence?: boolean): ObjectId | null
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        value = toObjectId(value);

        if (!isObjectId(value))
        {
            throw new BadRequestError();
        }

        return value;
    }

    protected parseObjectDeep (object: {[property: string]: any}, definition: Definition, parsedObject?: {[property: string]: any}, isForceExistence?: boolean): {[property: string]: any} | null
    {
        if (!isExist(object))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        if (!isExist(parsedObject))
        {
            parsedObject = {};
        }

        for (const property in object)
        {
            if (isExist(definition.properties[property])) // Checking this since the object may have a property that is not defined in the schema (maybe previously defined in the schema and then removed from it but remained in the DB).
            {
                switch (definition.properties[property].bsonType)
                {
                    case DbBsonType.BinaryData:
                    {
                        parsedObject[property] = this.parseBinaryData(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.Boolean:
                    {
                        parsedObject[property] = this.parseBoolean(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.Int:
                    {
                        parsedObject[property] = this.parseInt(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.Double:
                    {
                        parsedObject[property] = this.parseDouble(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.String:
                    {
                        parsedObject[property] = this.parseString(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.Date:
                    {
                        parsedObject[property] = this.parseDate(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.ObjectId:
                    {
                        parsedObject[property] = this.parseObjectId(object[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.Object:
                    {
                        parsedObject[property] = this.parseObjectDeep(object[property], definition.properties[property], parsedObject[property], isForceExistence);
                        break;
                    }
                    case DbBsonType.Array:
                    {
                        parsedObject[property] = this.parseArrayDeep(object[property], definition.properties[property], parsedObject[property], isForceExistence);
                        break;
                    }
                    default:
                    {
                        parsedObject[property] = object[property]; // If BSON type is not specified, leave value as is.
                    }
                }
            }
            else
            {
                if (this.layer === BaseService.LAYER.CONTROLLER)
                {
                    throw new BadRequestError();
                }
            }
        }

        return parsedObject;
    }

    protected parseArrayDeep (array: any[], definition: Definition, parsedArray?: any[], isForceExistence?: boolean): any[] | null
    {
        if (!isExist(array))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        if (!isExist(parsedArray))
        {
            parsedArray = [];
        }

        let parseFunction: any;

        switch (definition.items.bsonType)
        {
            case DbBsonType.BinaryData:
            {
                parseFunction = this.parseBinaryData;
                break;
            }
            case DbBsonType.Boolean:
            {
                parseFunction = this.parseBoolean;
                break;
            }
            case DbBsonType.Int:
            {
                parseFunction = this.parseInt.bind(this);
                break;
            }
            case DbBsonType.Double:
            {
                parseFunction = this.parseDouble;
                break;
            }
            case DbBsonType.String:
            {
                parseFunction = this.parseString;
                break;
            }
            case DbBsonType.Date:
            {
                parseFunction = this.parseDate;
                break;
            }
            case DbBsonType.ObjectId:
            {
                parseFunction = this.parseObjectId;
                break;
            }
            case DbBsonType.Object:
            {
                parseFunction = null;

                for (let i: number = 0; i < array.length; i++)
                {
                    parsedArray.push({}); // An empty object should be pushed in order to pass by reference.
                    this.parseObjectDeep(array[i], definition.items, parsedArray[parsedArray.length - 1], isForceExistence);
                }

                break;
            }
            case DbBsonType.Array:
            {
                parseFunction = null;

                for (let i: number = 0; i < array.length; i++)
                {
                    parsedArray.push([]); // an empty array should be pushed in order to pass by reference.
                    this.parseArrayDeep(array[i], definition.items, parsedArray[parsedArray.length - 1], isForceExistence);
                }

                break;
            }
            default:
            {
                parseFunction = (value: any, isForceExistence?: boolean): any | null =>
                {
                    if (!isExist(value))
                    {
                        if (isForceExistence)
                        {
                            throw new BadRequestError();
                        }

                        return null;
                    }

                    return value;
                }; // If BSON type is not specified, leave value as is.
            }
        }

        if (isExist(parseFunction))
        {
            for (let i: number = 0; i < array.length; i++)
            {
                parsedArray.push(parseFunction(array[i], isForceExistence));
            }
        }

        return parsedArray;
    }

    protected parse (value: any, definition: Definition, parsedValue?: any, isForceExistence?: boolean): any
    {
        if (!isExist(value))
        {
            if (isForceExistence)
            {
                throw new BadRequestError();
            }

            return null;
        }

        switch (definition.bsonType)
        {
            case DbBsonType.BinaryData:
            {
                return this.parseBinaryData(value, isForceExistence);
            }
            case DbBsonType.Boolean:
            {
                return this.parseBoolean(value, isForceExistence);
            }
            case DbBsonType.Int:
            {
                return this.parseInt(value, isForceExistence);
            }
            case DbBsonType.Double:
            {
                return this.parseDouble(value, isForceExistence);
            }
            case DbBsonType.String:
            {
                return this.parseString(value, isForceExistence);
            }
            case DbBsonType.Date:
            {
                return this.parseDate(value, isForceExistence);
            }
            case DbBsonType.ObjectId:
            {
                return this.parseObjectId(value, isForceExistence);
            }
            case DbBsonType.Object:
            {
                return this.parseObjectDeep(value, definition, parsedValue, isForceExistence);
            }
            case DbBsonType.Array:
            {
                return this.parseArrayDeep(value, definition, parsedValue, isForceExistence);
            }
            default:
            {
                return value; // If the BSON type is not specified, leave the value as is.
            }
        }
    }
}
