import {
    Document, WithId, Collection,
    AggregationCursor, FindCursor, InsertOneResult, Filter,
    CountDocumentsOptions, AggregateOptions, FindOptions, InsertOneOptions, FindOneAndUpdateOptions, FindOneAndDeleteOptions
} from "mongodb";
import _ from "lodash";

import {isExist, initialize, isInitialized} from "../utility/value";
import {toMongoDbDot} from "../utility/mongodb-dot-notation";
import DbSchema from "./DbSchema";

export type DocumentData =
    {
        [key: string]: any;
    }

export type UpdateOperation =
    {
        "$set": DocumentData;
        "$unset": {
            [property: string]: ""
        };
    }

export default class DbOperation<S extends DbSchema = DbSchema>
{
    public readonly schema: S;

    public constructor (schema: S)
    {
        this.schema = schema;
    }

    private convertToUpdateOperation (documentData: DocumentData): UpdateOperation
    {
        const updateOperation: UpdateOperation = {
            "$set": {},
            "$unset": {}
        };

        const dottedDocumentData: DocumentData = toMongoDbDot("u", documentData);

        for (const key in dottedDocumentData)
        {
            if (!isExist(dottedDocumentData[key])) // Means the field is sent to be deleted.
            {
                updateOperation["$unset"][key] = "";
            }
            else // Means the field is sent to be updated.
            {
                updateOperation["$set"][key] = dottedDocumentData[key];
            }
        }

        if (!isInitialized(updateOperation["$set"]))
        {
            delete updateOperation["$set"];
        }

        if (!isInitialized(updateOperation["$unset"]))
        {
            delete updateOperation["$unset"];
        }

        return updateOperation;
    }

    public get native (): Collection
    {
        return this.schema.collection;
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.countDocuments/
     */
    public async count (query?: Filter<Document>, options?: CountDocumentsOptions): Promise<number>
    {
        query = toMongoDbDot("r", query);
        options = initialize(options, {});
        return this.native.countDocuments(query, options);
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.aggregate/
     */
    public async aggregate (pipeline?: Document[], options?: AggregateOptions): Promise<Document[]>
    {
        options = initialize(options, {});
        const cursor: AggregationCursor<Document> = this.native.aggregate(pipeline, options);
        return cursor.toArray();
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.find/
     */
    public async read (query: Filter<Document>, options?: FindOptions): Promise<Document[]>
    {
        query = toMongoDbDot("r", query);
        options = initialize(options, {});

        if (isInitialized(options.sort) && _.isPlainObject(options.sort))
        {
            options.sort = toMongoDbDot("r", options.sort as object);
        }

        const cursor: FindCursor<WithId<Document>> = this.native.find(query, options);
        return cursor.toArray();
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.findOne/
     */
    public async readOne (query: Filter<Document>, options?: FindOptions): Promise<Document | null>
    {
        query = toMongoDbDot("r", query);
        options = initialize(options, {});
        return this.native.findOne(query, options);
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.insertOne/
     */
    public async createOne (documentData: Document, options?: InsertOneOptions): Promise<Document>
    {
        options = initialize(options, {});
        const result: InsertOneResult<Document> = await this.native.insertOne(documentData, options);
        return this.readOne({_id: result.insertedId}, isExist(options.session) ? {session: options.session} : {});
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndUpdate/
     */
    public async updateOne (query: Filter<Document>, documentData: Document, options?: FindOneAndUpdateOptions): Promise<Document | null>
    {
        options = initialize(options, {});
        const updateOperation: UpdateOperation = this.convertToUpdateOperation(documentData);
        return this.native.findOneAndUpdate(query, updateOperation, {...options, returnDocument: "after"});
    }

    /**
     * https://www.mongodb.com/docs/manual/reference/method/db.collection.findOneAndDelete/
     */
    public async deleteOne (query: Filter<Document>, options?: FindOneAndDeleteOptions): Promise<Document | null>
    {
        options = initialize(options, {});
        return this.native.findOneAndDelete(query, options || {});
    }
}
