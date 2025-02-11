import BaseError from "../BaseError";

export default class HttpError extends BaseError // Should be used as a base class.
{
    public statusCode: number;

    public constructor (statusCode: number, code?: string, message?: string, ...placeholders: string[])
    {
        super(code, message, ...placeholders); // Does not have a default code and message since this class should only be used as a base class.
        this.statusCode = statusCode;
    }
}
