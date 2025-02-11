import _ from "lodash";

import {isExist} from "./value";

export function toString (value: any): string | null
{
    if (_.isString(value))
    {
        return value;
    }

    if (isExist(value.toString))
    {
        value = value.toString();

        if (_.isString(value))
        {
            return value;
        }
    }

    return null;
}
