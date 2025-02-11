import {initialize} from "../../../../utility/value";
import ServerError from "../ServerError";

export default class InternalServerError extends ServerError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(500, initialize(code, "INTERNAL_SERVER"), initialize(message, "An unexpected error has occurred on the server. Please try again later."), ...placeholders);
    }
}
