import _ from "lodash";

import {validateFile} from "./utility/filesystem";
import DeveloperError from "./error/developer/DeveloperError";

export default class Interceptor
{
    private readonly intercept: Function;

    public constructor (path: string)
    {
        validateFile(path);

        const module: any = require(path);
        const intercept: Function = module.default; // Supports only ES Modules.

        if (!_.isFunction(intercept))
        {
            throw new DeveloperError("INVALID_INTERCEPTOR", "The provided interceptor is invalid. Please make sure that it exports a argument.");
        }

        this.intercept = intercept;
    }

    async execute (...args: any[]): Promise<void>
    {
        await this.intercept(...args);
    }
}
