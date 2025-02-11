import _ from "lodash";

import {isExist} from "./value";

export function isValidDate (value: any): boolean
{
    return isExist(value) && _.isDate(value) && _.isFinite(value.getTime());
}

export function toDate (value: any): Date | null
{
    if (isValidDate(value))
    {
        return value;
    }

    if (_.isString(value))
    {
        value = new Date(value);
    }

    if (isValidDate(value))
    {
        return value;
    }

    return null;
}

/**
 * Converts the provided timestamp to a UTC date string in the format "YYYY-MM-DD HH:MM:SS".
 *
 * @param timestamp - The Unix timestamp, in milliseconds.
 */
export function toUTCDateString (timestamp: number): string
{
    const date = new Date(timestamp);

    const zero = "0";

    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, zero);
    const day = date.getUTCDate().toString().padStart(2, zero);

    const hours = date.getUTCHours().toString().padStart(2, zero);
    const minutes = date.getUTCMinutes().toString().padStart(2, zero);
    const seconds = date.getUTCSeconds().toString().padStart(2, zero);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
