import {initialize} from "../../../../utility/value";
import ClientError from "../ClientError";

export default class UnauthorizedError extends ClientError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(401, initialize(code, "UNAUTHORIZED"), initialize(message, "The request could not be processed because authentication is required. Please provide valid credentials and try again."), ...placeholders);
    }
}
