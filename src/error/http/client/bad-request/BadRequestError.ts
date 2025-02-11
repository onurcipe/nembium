import {initialize} from "../../../../utility/value";
import ClientError from "../ClientError";

export default class BadRequestError extends ClientError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(400, initialize(code, "BAD_REQUEST"), initialize(message, "The request could not be processed due to invalid data. Please check your data and try again."), ...placeholders);
    }
}
