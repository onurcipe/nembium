import {ObjectId} from "mongodb";
import _ from "lodash";

export function isObjectId (value: any): boolean
{
    return value instanceof ObjectId;
}

export function toObjectId (value: any): ObjectId | null
{
    if (isObjectId(value))
    {
        return value;
    }

    if (_.isString(value))
    {
        try
        {
            value = new ObjectId(value);
        }
        catch (error)
        {
            return null;
        }

        return value;
    }

    return null;
}

export function isSameIds (id1: ObjectId, id2: ObjectId): boolean
{
    return id1.toString() === id2.toString();
}
