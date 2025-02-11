import HttpError from "../HttpError";

export default class ServerError extends HttpError // Should be used as a base class.
{
    public constructor (statusCode: number, code?: string, message?: string, ...placeholders: string[])
    {
        super(statusCode, code, message, ...placeholders); // Does not have a default code and message since this class should only be used as a base class.
    }
}
