import _ from "lodash";

import {isExist} from "./value";

export function isValidNumber (value: any): boolean
{
    return isExist(value) && _.isNumber(value) && _.isFinite(value);
}

export function toNumber (value: any): number | null
{
    if (isValidNumber(value))
    {
        return value;
    }

    if (_.isString(value))
    {
        value = _.toNumber(value);
    }

    if (isValidNumber(value))
    {
        return value;
    }

    return null;
}
