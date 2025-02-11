import _ from "lodash";
import {isExist} from "./value";

export function toMongoDbDot (mode: "r" | "u", value: {[key: string]: any} | any[], dottedValue?: {[key: string]: any}, previousKey?: string): {[key: string]: any}
{
    if (_.isPlainObject(value))
    {
        for (const key in value)
        {
            return toMongoDbDotForObject(mode, value, dottedValue, previousKey);
        }
    }
    else if (_.isArray(value))
    {
        if (mode === "r")
        {
            return toMongoDbDotForArray(mode, value, dottedValue, previousKey);
        }

        if (isExist(previousKey))
        {
            dottedValue[previousKey] = value;
        }

        return dottedValue;
    }
    else
    {
        if (isExist(previousKey))
        {
            dottedValue[previousKey] = value;
        }

        return dottedValue;
    }
}

export function toMongoDbDotForObject (mode: "r" | "u", object: {[key: string]: any}, fullObject?: {[key: string]: any}, previousKey?: string): {[key: string]: any}
{
    if (!isExist(fullObject))
    {
        fullObject = {};
    }

    for (const key in object)
    {
        if (key.charAt(0) === "$")
        {
            fullObject[previousKey] = {
                [key]: object[key]
            };
        }
        else
        {
            const fullKey: string = isExist(previousKey) ? `${previousKey}.${key}` : `${key}`;
            const intermediaryObject: {[key: string]: any} = toMongoDbDot(mode, object[key], {}, fullKey);
            for (const intermediaryKey in intermediaryObject)
            {
                fullObject[intermediaryKey] = intermediaryObject[intermediaryKey];
            }
        }
    }

    return fullObject;
}

export function toMongoDbDotForArray (mode: "r" | "u", array: any[], fullObject?: {[key: string]: any}, previousKey?: string): {[key: string]: any}
{
    if (!isExist(fullObject))
    {
        fullObject = {};
    }

    for (let i: number = 0; i < array.length; i++)
    {
        const fullKey: string = isExist(previousKey) ? `${previousKey}.${i}` : `${i}`;
        const intermediaryObject: {[key: string]: any} = toMongoDbDot(mode, array[i], {}, fullKey);
        for (const intermediaryKey in intermediaryObject)
        {
            fullObject[intermediaryKey] = intermediaryObject[intermediaryKey];
        }
    }

    return fullObject;
}
