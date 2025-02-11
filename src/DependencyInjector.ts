import path from "node:path";
import fs, {Stats} from "node:fs";

import _ from "lodash";

import {validateFile, validateDirectory} from "./utility/filesystem";
import {isExist, isInitialized} from "./utility/value";
import DeveloperError from "./error/developer/DeveloperError";
import InvalidArgumentError from "./error/developer/argument/InvalidArgumentError";

type C = any;

export default class DependencyInjector
{
    private readonly store: {
        [className: string]: {
            Class: C,
            instancesBundle: {
                instance: C,
                constructorParameters: any[]
            }[]
        }
    };

    public constructor (directory: string)
    {
        validateDirectory(directory);

        this.store = {};

        const exports: any[] = this.importDeep(directory);

        for (const Class of exports)
        {
            const className: string = Class.name;

            if (!_.isString(className))
            {
                continue;
            }

            this.store[className] = {
                Class,
                instancesBundle: []
            };
        }
    }

    private importDeep (path_: string): any[]
    {
        if (!fs.existsSync(path_))
        {
            throw new InvalidArgumentError();
        }

        const pathInformation: Stats = fs.lstatSync(path_);

        if (pathInformation.isFile())
        {
            validateFile(path_);
            const module: any = require(path_);
            const Class: C = module.default; // Supports only ES Modules.

            return [Class];
        }
        else if (pathInformation.isDirectory())
        {
            let Classes: C[] = [];

            validateDirectory(path_);
            const subPaths: string[] = fs.readdirSync(path_);

            for (let subPath of subPaths)
            {
                subPath = path.join(path_, subPath);
                const subPathInformation: Stats = fs.lstatSync(subPath);

                if (subPathInformation.isFile())
                {
                    validateFile(subPath);
                    const module: any = require(path.resolve(subPath));
                    const Class: C = module.default; // Supports only ES Modules.
                    Classes.push(Class);
                }
                else if (subPathInformation.isDirectory())
                {
                    validateDirectory(subPath);
                    Classes = _.concat(Classes, this.importDeep(subPath));
                }
            }

            return Classes;
        }
    }

    private getInstance (className: string, constructorParameters: any[]): C | null
    {
        const {instancesBundle} = this.store[className];

        if (!isInitialized(instancesBundle))
        {
            return null;
        }

        for (const instanceBundle of instancesBundle)
        {
            if (_.isEqual(instanceBundle.constructorParameters, constructorParameters))
            {
                return instanceBundle.instance;
            }
        }

        return null;
    }

    public inject (toBeInjectedClassName: string, toBeInjectedConstructorParameters: any[], injectingInstance: C, injectingConstructorParameters: any[]): C
    {
        if (!isExist(this.store[toBeInjectedClassName]))
        {
            throw new DeveloperError("INVALID_CLASS_NAME", "The provided class name is invalid. Please check your class name and try again.");
        }

        const injectingClassName: string = injectingInstance.constructor.name;

        // If the injecting instance has not already been injected, store it for further use. When it is tried to be injected, this stored instance will be ready to use.
        if (!isExist(this.getInstance(injectingClassName, injectingConstructorParameters)))
        {
            this.store[injectingClassName].instancesBundle.push({instance: injectingInstance, constructorParameters: injectingConstructorParameters});
        }

        // If an instance with the specified constructor parameters has already been stored, return it.
        let instance: C = this.getInstance(toBeInjectedClassName, toBeInjectedConstructorParameters);

        if (isExist(instance))
        {
            return instance;
        }

        // Create a new instance, store it for further use, and return it.
        const ToBeInjectedClass: C = this.store[toBeInjectedClassName].Class;
        instance = new ToBeInjectedClass(...toBeInjectedConstructorParameters);
        this.store[toBeInjectedClassName].instancesBundle.push({instance, constructorParameters: toBeInjectedConstructorParameters});
        return instance;
    }
}
