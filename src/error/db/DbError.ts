import {initialize} from "../../utility/value";
import BaseError from "../BaseError";

export default class DbError extends BaseError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "DB"), initialize(message, "A DB error has occurred."), ...placeholders);
    }
}
