import _ from "lodash";

/**
 * Checks if the provided value is defined and exists.
 *
 * Definition: Being `defined` is having a value other than `undefined`.
 * Definition: Being `exist` is being defined and having a value other than `null`.
 */
export function isExist<T> (value: T | undefined | null): value is T
{
    return value !== undefined && value !== null;
}

/**
 * Checks if the provided value is initialized with a non-empty value.
 *
 * Definition: Being `initialized` is being `exist` and having a non-empty value.
 */
export function isInitialized<T> (value: T | undefined | null): value is T
{
    if (!isExist(value))
    {
        return false;
    }

    if (_.isNumber(value))
    {
        return _.isFinite(value);
    }
    else if (_.isString(value) || _.isPlainObject(value) || _.isArray(value))
    {
        return !_.isEmpty(value);
    }

    return true;
}

/**
 * Initializes the provided value with the provided default value if not already initialized.
 */
export function initialize<T> (value: T | undefined | null, defaultValue: T): T
{
    if (!isInitialized(value))
    {
        if (_.isObjectLike(value))
        {
            value = _.cloneDeep(defaultValue);
        }
        else
        {
            value = defaultValue;
        }
    }

    return value;
}
