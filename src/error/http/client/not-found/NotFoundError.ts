import {initialize} from "../../../../utility/value";
import ClientError from "../ClientError";

export default class NotFoundError extends ClientError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(404, initialize(code, "NOT_FOUND"), initialize(message, "The requested resource could not be found."), ...placeholders);
    }
}
