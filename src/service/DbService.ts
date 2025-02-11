import {
    ClientSession,
    Document,
    CountDocumentsOptions, FindOptions, InsertOneOptions, FindOneAndUpdateOptions, FindOneAndDeleteOptions
} from "mongodb";

import {isExist, initialize} from "../utility/value";
import InvalidArgumentError from "../error/developer/argument/InvalidArgumentError";
import DbSchema from "../db/DbSchema";
import DbOperation from "../db/DbOperation";
import DbSessionManager from "../db/DbSessionManager";
import BaseService from "./BaseService";

export type Options<S extends DbSchema = DbSchema, DBO extends DbOperation<S> = DbOperation<S>> =
    {
        schema?: S;
        dbOperation?: DBO;
        persona?: string;
    }

export type Query =
    {
        [key: string]: any;
    }

export type DocumentData =
    {
        [key: string]: any;
    }

export type CountHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeCount?: (query: Query, options: CountDocumentsOptions, session?: ClientSession) => Promise<void>;
        afterCount?: (count: number, session?: ClientSession) => Promise<void>;
    }

export type ReadHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeRead?: (query: Query, options: FindOptions, session?: ClientSession) => Promise<void>;
        afterRead?: (documents: Document[], session?: ClientSession) => Promise<void>;
    }

export type ReadOneHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeReadOne?: (query: Query, options: FindOptions, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type CreateOneHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeCreateOne?: (documentData: DocumentData, options: InsertOneOptions, session?: ClientSession) => Promise<void>;
        afterCreateOne?: (document: Document, session?: ClientSession) => Promise<void>;
    }

export type UpdateOneHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeUpdateOne?: (query: Query, documentData: DocumentData, options: FindOneAndUpdateOptions, session?: ClientSession) => Promise<void>;
        afterUpdateOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type DeleteOneHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeDeleteOne?: (query: Query, options: FindOneAndDeleteOptions, session?: ClientSession) => Promise<void>;
        afterDeleteOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export default class DbService<S extends DbSchema = DbSchema, DBO extends DbOperation<S> = DbOperation<S>> extends BaseService
{
    public readonly dbOperation: DBO;

    public constructor (options: Options<S, DBO>)
    {
        super(BaseService.LAYER.DB, options?.persona);

        if (isExist(options.schema) && !isExist(options.dbOperation))
        {
            this.dbOperation = new DbOperation(options.schema) as DBO;
        }
        else if (!isExist(options.schema) && isExist(options.dbOperation))
        {
            this.dbOperation = options.dbOperation;
        }
        else
        {
            throw new InvalidArgumentError();
        }
    }

    public async count (query: Query, options?: CountDocumentsOptions, hooks?: CountHooks): Promise<number>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbOperation.schema.definition);

        let count: number;
        const {session, internalSession} = DbSessionManager.startSession(options.session, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeCount) ? await hooks.beforeCount(query, options, session) : undefined;
                count = await this.dbOperation.count(query, {...options, session});
                isExist(hooks.afterCount) ? await hooks.afterCount(count, session) : undefined;
            },
            options.session,
            internalSession
        );

        return count;
    }

    public async read (query: Query, options?: FindOptions, hooks?: ReadHooks): Promise<Document[]>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbOperation.schema.definition);

        let documents: Document[] = [];
        const {session, internalSession} = DbSessionManager.startSession(options.session, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeRead) ? await hooks.beforeRead(query, options, session) : undefined;
                documents = await this.dbOperation.read(query, {...options, session});
                isExist(hooks.afterRead) ? await hooks.afterRead(documents, session) : undefined;
            },
            options.session,
            internalSession
        );

        return documents;
    }

    public async readOne (query: Query, options?: FindOptions, hooks?: ReadOneHooks): Promise<Document | null>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbOperation.schema.definition);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(options.session, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(query, options, session) : undefined;
                document = await this.dbOperation.readOne(query, {...options, session});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;
            },
            options.session,
            internalSession
        );

        return document;
    }

    public async createOne (documentData: DocumentData, options?: InsertOneOptions, hooks?: CreateOneHooks): Promise<Document>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        documentData = this.parse(documentData, this.dbOperation.schema.definition);

        let document: Document;
        const {session, internalSession} = DbSessionManager.startSession(options.session, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeCreateOne) ? await hooks.beforeCreateOne(documentData, options, session) : undefined;
                document = await this.dbOperation.createOne(documentData, {...options, session});
                isExist(hooks.afterCreateOne) ? await hooks.afterCreateOne(document, session) : undefined;
            },
            options.session,
            internalSession
        );

        return document;
    }

    public async updateOne (query: Query, documentData: DocumentData, options?: FindOneAndUpdateOptions, hooks?: UpdateOneHooks): Promise<Document | null>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbOperation.schema.definition);
        documentData = this.parse(documentData, this.dbOperation.schema.definition);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(options.session, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeUpdateOne) ? await hooks.beforeUpdateOne(query, documentData, options, session) : undefined;
                document = await this.dbOperation.updateOne(query, documentData, {...options, session});
                isExist(hooks.afterUpdateOne) ? await hooks.afterUpdateOne(document, session) : undefined;
            },
            options.session,
            internalSession
        );

        return document;
    }

    public async deleteOne (query: Query, options?: FindOneAndDeleteOptions, hooks?: DeleteOneHooks): Promise<Document | null>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbOperation.schema.definition, undefined);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(options.session, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeDeleteOne) ? await hooks.beforeDeleteOne(query, options, session) : undefined;
                document = await this.dbOperation.deleteOne(query, {...options, session});
                isExist(hooks.afterDeleteOne) ? await hooks.afterDeleteOne(document, session) : undefined;
            },
            options.session,
            internalSession
        );

        return document;
    }
}
