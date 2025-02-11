import {Db, Document, Collection} from "mongodb";
import _ from "lodash";

import {isInitialized, initialize} from "../utility/value";
import DeveloperError from "../error/developer/DeveloperError";
import Nembium from "../Nembium";
import DbBsonType from "./DbBsonType";

export type Config =
    {
        isAddCommonProperties: boolean;
        isValidationEnabled: boolean;
    }

export type Definition =
    {
        description?: string;

        bsonType: string;

        additionalProperties?: boolean;
        required?: string[];
        forbiddenFromPersonas?: string[] | "*";

        enum?: string[],
        minimum?: number,

        properties?: {[property: string]: Definition}; // Required if the BSON type is an object.
        items?: Definition; // Required if the BSON type is an array.
    }

export default class DbSchema
{
    private readonly db: Db;
    public readonly collection: Collection;

    private readonly isAddCommonProperties: boolean;
    private readonly isValidationEnabled: boolean;

    public readonly definition: Definition;

    public static readonly FORBIDDEN_FROM_ALL_PERSONAS: "*" = "*";

    public constructor (dbName: string, collectionName: string, config: Config, definition: Definition)
    {
        this.db = Nembium.db.connection.db(dbName);
        this.collection = this.db.collection(collectionName);

        this.isAddCommonProperties = config.isAddCommonProperties;
        this.isValidationEnabled = config.isValidationEnabled;

        this.definition = definition;

        if (this.isAddCommonProperties)
        {
            this.definition.properties = initialize(this.definition.properties, {});
            this.definition.required = initialize(this.definition.required, []);

            this.definition.properties._id = {bsonType: DbBsonType.ObjectId};
            this.definition.required.push("_id");

            this.definition.properties.version = {bsonType: DbBsonType.Int};
            this.definition.required.push("version");

            this.definition.properties.isSoftDeleted = {bsonType: DbBsonType.Boolean, forbiddenFromPersonas: DbSchema.FORBIDDEN_FROM_ALL_PERSONAS};
            this.definition.required.push("isSoftDeleted");

            this.definition.properties.createdAt = {bsonType: DbBsonType.Date, forbiddenFromPersonas: DbSchema.FORBIDDEN_FROM_ALL_PERSONAS};
            this.definition.required.push("createdAt");

            this.definition.properties.updatedAt = {bsonType: DbBsonType.Date, forbiddenFromPersonas: DbSchema.FORBIDDEN_FROM_ALL_PERSONAS};

            this.definition.properties.softDeletedAt = {bsonType: DbBsonType.Date, forbiddenFromPersonas: DbSchema.FORBIDDEN_FROM_ALL_PERSONAS};

            this.collection.createIndex({isSoftDeleted: -1}); // Brings `true` first.
        }

        this.createOrUpdateCollection(); // Be careful when updating the `definition` or running an operation that depends on it since realizing the changes on the MongoDB might take some time and the constructor cannot be asynchronous.
    }

    private async createOrUpdateCollection (): Promise<void>
    {
        const validator: Document = this.isValidationEnabled ? {$jsonSchema: this.cleanDefinition()} : {}; // https://www.mongodb.com/docs/manual/reference/command/collMod/#mongodb-collflag-validator
        const validationLevel: string = this.isValidationEnabled ? "moderate" : "off"; // https://www.mongodb.com/docs/manual/reference/command/collMod/#mongodb-collflag-validationLevel

        try
        {
            await this.db.createCollection(this.collection.collectionName, {validator, validationLevel});
        }
        catch (error: any)
        {
            switch (error?.code)
            {
                case 48: // `NamespaceExists` error occurs when creating a collection with a name that already exists. This is expected to occur on each launch except the first one. However, if the collection's definition changes, it must be updated.
                {
                    try
                    {
                        await this.db.command({collMod: this.collection.collectionName, validator, validationLevel});
                    }
                    catch (error: any)
                    {
                        switch (error.code)
                        {
                            case 9: // `FailedToParse` error.
                            {
                                throw new DeveloperError("INVALID_SCHEMA_DEFINITION", "The schema definition is invalid. Please check your implementation.");
                            }
                            default:
                            {
                                throw error;
                            }
                        }
                    }

                    break;
                }
                case 9: // `FailedToParse` error.
                {
                    throw new DeveloperError("INVALID_SCHEMA_DEFINITION", "The schema definition is invalid. Please check your implementation.");
                }
                default:
                {
                    throw error;
                }
            }
        }
    }

    private cleanDefinition (): Definition
    {
        const cleanedDefinition: Definition = _.cloneDeep(this.definition);
        this.cleanDefinitionDeep(cleanedDefinition);
        return cleanedDefinition;
    }

    private cleanDefinitionDeep (definition: Definition): void
    {
        if (isInitialized(definition))
        {
            delete definition?.forbiddenFromPersonas;

            switch (definition.bsonType)
            {
                case DbBsonType.Object:
                {
                    for (const property in definition.properties)
                    {
                        this.cleanDefinitionDeep(definition.properties[property]);
                    }

                    break;
                }
                case DbBsonType.Array:
                {
                    this.cleanDefinitionDeep(definition.items);

                    break;
                }
            }
        }
    }
}
