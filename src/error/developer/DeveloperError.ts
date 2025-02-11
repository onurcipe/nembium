import {initialize} from "../../utility/value";
import BaseError from "../BaseError";

export default class DeveloperError extends BaseError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "DEVELOPER"), initialize(message, "A developer error has occurred. Please check your implementation."), ...placeholders);
    }
}
