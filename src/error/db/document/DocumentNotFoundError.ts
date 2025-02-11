import {initialize} from "../../../utility/value";
import DbError from "../DbError";

export default class DocumentNotFoundError extends DbError
{
    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        super(initialize(code, "DOCUMENT_NOT_FOUND"), initialize(message, "The document does not exist."), ...placeholders);
    }
}
