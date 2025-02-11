import _ from "lodash";

export function toBoolean (value: any): boolean | null
{
    if (_.isBoolean(value))
    {
        return value;
    }

    if (_.isString(value))
    {
        if (value === "true")
        {
            value = true;
        }
        else if (value === "false")
        {
            value = false;
        }
    }

    if (_.isBoolean(value))
    {
        return value;
    }

    return null;
}
