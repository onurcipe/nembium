import {isInitialized, initialize} from "../utility/value";

export default class BaseError
{
    public callStack: string;
    public code: string;
    public message: string;

    public constructor (code?: string, message?: string, ...placeholders: string[])
    {
        this.callStack = new Error().stack;
        this.code = initialize(code, "UNKNOWN");
        this.message = initialize(message, "An unknown error has occurred.");

        if (isInitialized(placeholders))
        {
            this.updateMessageWithPlaceholders(...placeholders);
        }
    }

    protected updateMessageWithPlaceholders (...placeholders: string[]): void
    {
        for (let i = 0; i < placeholders.length; i++)
        {
            this.message = this.message.replace(`$${i}`, placeholders[i]);
        }
    }
}
