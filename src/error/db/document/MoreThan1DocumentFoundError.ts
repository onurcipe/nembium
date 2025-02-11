import {initialize} from "../../../utility/value";
import DbError from "../DbError";

export default class MoreThan1DocumentFoundError extends DbError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "MORE_THAN_1_DOCUMENT_FOUND"), initialize(message, "You are supposed to find 1 document for this query, but you found multiple documents instead."), ...placeholders);
    }
}
