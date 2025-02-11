import {initialize} from "../../../utility/value";
import DeveloperError from "../DeveloperError";

export default class FileNotFoundError extends DeveloperError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "FILE_NOT_FOUND"), initialize(message, "The specified file is not found."), ...placeholders);
    }
}
