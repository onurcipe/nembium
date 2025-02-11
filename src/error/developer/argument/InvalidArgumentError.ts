import {initialize} from "../../../utility/value";
import DeveloperError from "../DeveloperError";

export default class InvalidArgumentError extends DeveloperError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "INVALID_ARGUMENT"), initialize(message, "The provided argument is invalid."), ...placeholders);
    }
}
