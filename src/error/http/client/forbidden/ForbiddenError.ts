import {initialize} from "../../../../utility/value";
import ClientError from "../ClientError";

export default class ForbiddenError extends ClientError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(403, initialize(code, "FORBIDDEN"), initialize(message, "The request could not be processed because you lack the necessary permissions. Please contact the support if you believe this is an error."), ...placeholders);
    }
}
