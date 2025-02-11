import {initialize} from "../../../utility/value";
import DeveloperError from "../DeveloperError";

export default class DirectoryNotFoundError extends DeveloperError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "DIRECTORY_NOT_FOUND"), initialize(message, "The specified directory is not found."), ...placeholders);
    }
}
