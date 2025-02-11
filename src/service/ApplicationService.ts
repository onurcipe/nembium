import {ClientSession, ObjectId, Document, SortDirection} from "mongodb";
import _ from "lodash";

import {isExist, isInitialized, initialize} from "../utility/value";
import DeveloperError from "../error/developer/DeveloperError";
import InvalidArgumentError from "../error/developer/argument/InvalidArgumentError";
import DocumentNotFoundError from "../error/db/document/DocumentNotFoundError";
import MoreThan1DocumentFoundError from "../error/db/document/MoreThan1DocumentFoundError";
import BadRequestError from "../error/http/client/bad-request/BadRequestError";
import DbBsonType from "../db/DbBsonType";
import DbSchema, {Definition} from "../db/DbSchema";
import DbOperation, {DocumentData} from "../db/DbOperation";
import DbSessionManager from "../db/DbSessionManager";
import BaseService from "./BaseService";
import DbService, {Query} from "./DbService";
import {verify} from "node:crypto";

export type Options<S extends DbSchema = DbSchema, DBO extends DbOperation<S> = DbOperation<S>, DBS extends DbService<S, DBO> = DbService<S, DBO>> =
    {
        schema?: S;
        dbOperation?: DBO;
        dbService?: DBS;
        persona?: string;
        isRaiseDocumentExistenceErrors?: boolean;
    }

export type CountOptions =
    {
        limit?: number;
        skip?: number;
    }

export type CountHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeCount?: (query: Query, options: CountOptions, session?: ClientSession) => Promise<void>;
        afterCount?: (count: number, session?: ClientSession) => Promise<void>;
    }

export type ReadOptions =
    {
        limit?: number;
        skip?: number;
        sort?: {
            [key: string]: SortDirection;
        };
    }

export type ReadHooks =
    {
        isSessionEnabled?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeRead?: (query: Query, options: ReadOptions, session?: ClientSession) => Promise<void>;
        afterRead?: (documents: Document[], session?: ClientSession) => Promise<void>;
    }

export type ReadOneHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeReadOne?: (query: Query, options: ReadOptions, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type ReadOneByIdHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeReadOne?: (_id: ObjectId, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type ReadOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeReadOne?: (_id: ObjectId, version: number, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type CreateOneHooks =
    {
        isSessionEnabled?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeCreateOne?: (documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterCreateOne?: (document: Document, session?: ClientSession) => Promise<void>;
    }

export type UpdateOneHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeRead?: (query: Query, session?: ClientSession) => Promise<void>;
        afterRead?: (documents: Document[], session?: ClientSession) => Promise<void>;
        beforeUpdateOne?: (document: Document, documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterUpdateOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type UpdateOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeReadOne?: (_id: ObjectId, version: number, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
        beforeUpdateOne?: (document: Document, documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterUpdateOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type SoftDeleteOneHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeRead?: (query: Query, session?: ClientSession) => Promise<void>;
        afterRead?: (documents: Document[], session?: ClientSession) => Promise<void>;
        beforeUpdateOne?: (document: Document, documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterUpdateOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type SoftDeleteOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeReadOne?: (_id: ObjectId, version: number, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
        beforeUpdateOne?: (document: Document, documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterUpdateOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type DeleteOneHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeRead?: (query: Query, session?: ClientSession) => Promise<void>;
        afterRead?: (documents: Document[], session?: ClientSession) => Promise<void>;
        beforeDeleteOne?: (document: Document, session?: ClientSession) => Promise<void>;
        afterDeleteOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type DeleteOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        isKeepForbiddenFields?: boolean;
        bearer?: any;
        beforeReadOne?: (_id: ObjectId, version: number, session?: ClientSession) => Promise<void>;
        afterReadOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
        beforeDeleteOne?: (document: Document, session?: ClientSession) => Promise<void>;
        afterDeleteOne?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export default class ApplicationService<S extends DbSchema = DbSchema, DBO extends DbOperation<S> = DbOperation<S>, DBS extends DbService<S, DBO> = DbService<S, DBO>> extends BaseService
{
    public readonly dbService: DBS;
    private readonly isRaiseDocumentExistenceErrors: boolean;

    public constructor (options: Options<S, DBO, DBS>)
    {
        super(BaseService.LAYER.APPLICATION, options.persona);

        if (isExist(options.schema) && !isExist(options.dbOperation) && !isExist(options.dbService))
        {
            this.dbService = new DbService({schema: options.schema, persona: options.persona}) as DBS;
        }
        else if (!isExist(options.schema) && isExist(options.dbOperation) && !isExist(options.dbService))
        {
            this.dbService = new DbService({dbOperation: options.dbOperation, persona: options.persona}) as DBS;
        }
        else if (!isExist(options.schema) && !isExist(options.dbOperation) && isExist(options.dbService))
        {
            this.dbService = options.dbService;
        }
        else
        {
            throw new InvalidArgumentError();
        }

        this.isRaiseDocumentExistenceErrors = initialize(options.isRaiseDocumentExistenceErrors, false); // This can be overridden by hooks.
    }

    private checkVersion (documentVersion: number | string, queriedVersion: number | string): void
    {
        if (documentVersion < queriedVersion)
        {
            throw new BadRequestError();
        }
        else if (documentVersion > queriedVersion)
        {
            throw new BadRequestError("DOCUMENT_INVALID_VERSION", "The document's latest version is $0, while yours is $1.", documentVersion.toString(), queriedVersion.toString());
        }
    }

    private checkDocumentSingularity (document: Document, isRaiseDocumentExistenceErrorsByHook: boolean): void
    {
        if (isExist(isRaiseDocumentExistenceErrorsByHook))
        {
            if (isRaiseDocumentExistenceErrorsByHook && !isExist(document))
            {
                throw new DocumentNotFoundError();
            }
        }
        else
        {
            if (this.isRaiseDocumentExistenceErrors && !isExist(document))
            {
                throw new DocumentNotFoundError();
            }
        }
    }

    private checkDocumentsSingularity (documents: Document[], isRaiseDocumentExistenceErrorsByHook: boolean): Document | null
    {
        if (isExist(isRaiseDocumentExistenceErrorsByHook))
        {
            if (isRaiseDocumentExistenceErrorsByHook)
            {
                switch (documents.length)
                {
                    case 0:
                    {
                        throw new DocumentNotFoundError();
                    }
                    case 1:
                    {
                        return documents[0];
                    }
                    default:
                    {
                        throw new MoreThan1DocumentFoundError();
                    }
                }
            }
        }
        else
        {
            if (this.isRaiseDocumentExistenceErrors)
            {
                switch (documents.length)
                {
                    case 0:
                    {
                        throw new DocumentNotFoundError();
                    }
                    case 1:
                    {
                        return documents[0];
                    }
                    default:
                    {
                        throw new MoreThan1DocumentFoundError();
                    }
                }
            }
        }

        if (documents.length === 1)
        {
            return documents[0];
        }
        else
        {
            return null;
        }
    }

    private isPersonaForbidden (definition: Definition): boolean
    {
        if (!isInitialized(definition.forbiddenFromPersonas))
        {
            return false;
        }

        if (_.isString(definition.forbiddenFromPersonas) && definition.forbiddenFromPersonas === DbSchema.FORBIDDEN_FROM_ALL_PERSONAS)
        {
            return true;
        }

        if (_.isArray(definition.forbiddenFromPersonas))
        {
            return definition.forbiddenFromPersonas.includes(this.persona);
        }

        throw new DeveloperError("INVALID_SCHEMA_DEFINITION-FORBIDDEN_FROM_PERSONAS", "The schema definition is invalid. Please check your `forbiddenFromPersonas` field.`.");
    }

    private removeForbiddenPropertiesFromObjectDeep (object: {[key: string]: any}, definition: Definition): void
    {
        for (const property in object)
        {
            const isPersonaForbidden: boolean = this.isPersonaForbidden(definition.properties[property]);

            if (isPersonaForbidden)
            {
                delete object[property];
            }
            else
            {
                if (isExist(definition.properties[property])) // Checking this since the object may have a property that is not defined in the schema (maybe previously defined in the schema and then removed from it but remained in the DB).
                {
                    switch (definition.properties[property].bsonType)
                    {
                        case DbBsonType.BinaryData:
                        case DbBsonType.Boolean:
                        case DbBsonType.Int:
                        case DbBsonType.Double:
                        case DbBsonType.String:
                        case DbBsonType.ObjectId:
                        case DbBsonType.Date:
                        {
                            // Reached the deepest level.
                            break;
                        }
                        case DbBsonType.Object:
                        {
                            this.removeForbiddenPropertiesFromObjectDeep(object[property], definition.properties[property]);
                            break;
                        }
                        case DbBsonType.Array:
                        {
                            this.removeForbiddenPropertiesFromArrayDeep(object[property], definition.properties[property]);
                            break;
                        }
                        default:
                        {
                            // If the BSON type is not specified, leave the value as is.
                        }
                    }
                }
            }
        }
    }

    private removeForbiddenPropertiesFromArrayDeep (array: any[], definition: Definition): void
    {
        const isPersonaForbidden: boolean = this.isPersonaForbidden(definition.items);

        if (isPersonaForbidden)
        {
            for (let i: number = 0; i < array.length; i++)
            {
                array.splice(i, 1);
                i--;
            }
        }
        else
        {
            switch (definition.items.bsonType)
            {
                case DbBsonType.BinaryData:
                case DbBsonType.Boolean:
                case DbBsonType.Int:
                case DbBsonType.Double:
                case DbBsonType.String:
                case DbBsonType.ObjectId:
                case DbBsonType.Date:
                {
                    // Reached the deepest level.
                    break;
                }
                case DbBsonType.Object:
                {
                    for (let i: number = 0; i < array.length; i++)
                    {
                        const element: any = array[i];
                        this.removeForbiddenPropertiesFromObjectDeep(element, definition.items);
                    }

                    break;
                }
                case DbBsonType.Array:
                {
                    for (let i: number = 0; i < array.length; i++)
                    {
                        const element: any = array[i];
                        this.removeForbiddenPropertiesFromArrayDeep(element, definition.items);
                    }
                    break;
                }
                default:
                {
                    // If the BSON type is not specified, leave the value as is.
                }
            }
        }
    }

    public removeForbiddenPropertiesFromDocument (document: Document): void
    {
        if (isExist(this.persona))
        {
            if (isExist(this.dbService.dbOperation.schema.definition))
            {
                if (this.isPersonaForbidden(this.dbService.dbOperation.schema.definition))
                {
                    for (const property in document)
                    {
                        delete document[property];
                    }
                }
                else
                {
                    this.removeForbiddenPropertiesFromObjectDeep(document, this.dbService.dbOperation.schema.definition);
                }
            }
        }
    }

    public async count (query: Query, options?: CountOptions, externalSession?: ClientSession, hooks?: CountHooks): Promise<number>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbService.dbOperation.schema.definition);
        query.isSoftDeleted = false;

        let count: number;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeCount) ? await hooks.beforeCount(query, options, session) : undefined;
                count = await this.dbService.count(query, {...options, session});
                isExist(hooks.afterCount) ? await hooks.afterCount(count, session) : undefined;
            },
            externalSession,
            internalSession
        );

        return count;
    }

    public async read (query: Query, options?: ReadOptions, externalSession?: ClientSession, hooks?: ReadHooks): Promise<Document[]>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbService.dbOperation.schema.definition);
        query.isSoftDeleted = false;

        let documents: Document[] = [];
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeRead) ? await hooks.beforeRead(query, options, session) : undefined;
                documents = await this.dbService.read(query, {...options, session}, {bearer: hooks.bearer});
                isExist(hooks.afterRead) ? await hooks.afterRead(documents, session) : undefined;

                if (!hooks.isKeepForbiddenFields && isInitialized(documents))
                {
                    for (const document of documents)
                    {
                        if (isExist(document))
                        {
                            this.removeForbiddenPropertiesFromDocument(document);
                        }
                    }
                }
            },
            externalSession,
            internalSession
        );

        return documents;
    }

    public async readOne (query: Query, options?: ReadOptions, externalSession?: ClientSession, hooks?: ReadOneHooks): Promise<Document | null>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbService.dbOperation.schema.definition);
        query.isSoftDeleted = false;

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(query, options, session) : undefined;
                document = await this.dbService.readOne(query, {...options, session}, {bearer: hooks.bearer});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;

                this.checkDocumentSingularity(document, hooks.isRaiseDocumentExistenceErrors);

                if (!hooks.isKeepForbiddenFields && isExist(document))
                {
                    this.removeForbiddenPropertiesFromDocument(document);
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async readOneById (_id: ObjectId | string, externalSession?: ClientSession, hooks?: ReadOneByIdHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id);

        if (!isExist(_id))
        {
            throw new InvalidArgumentError();
        }

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(_id, session) : undefined;
                document = await this.dbService.readOne({_id, isSoftDeleted: false}, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;

                this.checkDocumentSingularity(document, hooks.isRaiseDocumentExistenceErrors);

                if (!hooks.isKeepForbiddenFields && isExist(document))
                {
                    this.removeForbiddenPropertiesFromDocument(document);
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async readOneByIdAndVersion (_id: ObjectId | string, version: number | string, externalSession?: ClientSession, hooks?: ReadOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id);
        version = this.parseVersion(_id);

        if (!isExist(_id) || !isExist(version))
        {
            throw new InvalidArgumentError();
        }

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(_id, version, session) : undefined;
                document = await this.dbService.readOne({_id, isSoftDeleted: false}, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;

                this.checkDocumentSingularity(document, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    this.checkVersion(document.version, version);
                }

                if (!hooks.isKeepForbiddenFields && isExist(document))
                {
                    this.removeForbiddenPropertiesFromDocument(document);
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async createOne (documentData: DocumentData, externalSession?: ClientSession, hooks?: CreateOneHooks): Promise<Document>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        documentData = this.parse(documentData, this.dbService.dbOperation.schema.definition);

        let document: Document;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                documentData = {
                    ...documentData,
                    version: 0,
                    isSoftDeleted: false,
                    createdAt: new Date()
                };

                isExist(hooks.beforeCreateOne) ? await hooks.beforeCreateOne(documentData, session) : undefined;
                document = await this.dbService.createOne(documentData, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterCreateOne) ? await hooks.afterCreateOne(document, session) : undefined;

                if (!hooks.isKeepForbiddenFields && isExist(document))
                {
                    this.removeForbiddenPropertiesFromDocument(document);
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async updateOne (query: Query, documentData: DocumentData, externalSession?: ClientSession, hooks?: UpdateOneHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbService.dbOperation.schema.definition);
        query.isSoftDeleted = false;

        documentData = this.parse(documentData, this.dbService.dbOperation.schema.definition);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeRead) ? await hooks.beforeRead(query, session) : undefined;
                const documents: Document[] = await this.dbService.read(query, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterRead) ? await hooks.afterRead(documents, session) : undefined;

                document = this.checkDocumentsSingularity(documents, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    documentData = {
                        ...documentData,
                        version: document.version + 1,
                        updatedAt: new Date()
                    };

                    isExist(hooks.beforeUpdateOne) ? await hooks.beforeUpdateOne(document, documentData, session) : undefined;
                    document = await this.dbService.updateOne({_id: document._id, version: document.version}, documentData, {session}, {bearer: hooks.bearer});
                    isExist(hooks.afterUpdateOne) ? await hooks.afterUpdateOne(document, session) : undefined;

                    if (!hooks.isKeepForbiddenFields && isExist(document))
                    {
                        this.removeForbiddenPropertiesFromDocument(document);
                    }
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async updateOneByIdAndVersion (_id: ObjectId | string, version: number | string, documentData: DocumentData, externalSession?: ClientSession, hooks?: UpdateOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id);
        version = this.parseVersion(version);

        if (!isExist(_id) || !isExist(version))
        {
            throw new InvalidArgumentError();
        }

        documentData = this.parse(documentData, this.dbService.dbOperation.schema.definition);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(_id, version, session) : undefined;
                document = await this.dbService.readOne({_id, isSoftDeleted: false}, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;

                this.checkDocumentSingularity(document, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    this.checkVersion(document.version, version);

                    documentData = {
                        ...documentData,
                        version: document.version + 1,
                        updatedAt: new Date()
                    };

                    isExist(hooks.beforeUpdateOne) ? await hooks.beforeUpdateOne(document, documentData, session) : undefined;
                    document = await this.dbService.updateOne({_id, version, isSoftDeleted: false}, documentData, {session}, {bearer: hooks.bearer});
                    isExist(hooks.afterUpdateOne) ? await hooks.afterUpdateOne(document, session) : undefined;

                    if (!hooks.isKeepForbiddenFields && isExist(document))
                    {
                        this.removeForbiddenPropertiesFromDocument(document);
                    }
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async softDeleteOne (query: Query, externalSession?: ClientSession, hooks?: SoftDeleteOneHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbService.dbOperation.schema.definition);
        query.isSoftDeleted = false;

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeRead) ? await hooks.beforeRead(query, session) : undefined;
                const documents: Document[] = await this.dbService.read(query, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterRead) ? await hooks.afterRead(documents, session) : undefined;

                document = this.checkDocumentsSingularity(documents, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    const documentData = {
                        version: document.version + 1,
                        isSoftDeleted: true,
                        softDeletedAt: new Date()
                    };

                    isExist(hooks.beforeUpdateOne) ? await hooks.beforeUpdateOne(document, documentData, session) : undefined;
                    document = await this.dbService.updateOne({_id: document._id, version: document.version}, documentData, {session}, {bearer: hooks.bearer});
                    isExist(hooks.afterUpdateOne) ? await hooks.afterUpdateOne(document, session) : undefined;

                    if (!hooks.isKeepForbiddenFields && isExist(document))
                    {
                        this.removeForbiddenPropertiesFromDocument(document);
                    }
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    public async softDeleteOneByIdAndVersion (_id: ObjectId | string, version: number | string, externalSession?: ClientSession, hooks?: SoftDeleteOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id);
        version = this.parseVersion(version);

        if (!isExist(_id) || !isExist(version))
        {
            throw new InvalidArgumentError();
        }

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(_id, version, session) : undefined;
                document = await this.dbService.readOne({_id, isSoftDeleted: false}, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;

                this.checkDocumentSingularity(document, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    this.checkVersion(document.version, version);

                    const documentData = {
                        version: document.version + 1,
                        isSoftDeleted: true,
                        softDeletedAt: new Date()
                    };

                    isExist(hooks.beforeUpdateOne) ? await hooks.beforeUpdateOne(document, documentData, session) : undefined;
                    document = await this.dbService.updateOne({_id, version, isSoftDeleted: false}, documentData, {session}, {bearer: hooks.bearer});
                    isExist(hooks.afterUpdateOne) ? await hooks.afterUpdateOne(document, session) : undefined;

                    if (!hooks.isKeepForbiddenFields && isExist(document))
                    {
                        this.removeForbiddenPropertiesFromDocument(document);
                    }
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    async deleteOne (query: Query, externalSession?: ClientSession, hooks?: DeleteOneHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.dbService.dbOperation.schema.definition);
        query.isSoftDeleted = false;

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeRead) ? await hooks.beforeRead(query, session) : undefined;
                const documents: Document[] = await this.dbService.read(query, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterRead) ? await hooks.afterRead(documents, session) : undefined;

                document = this.checkDocumentsSingularity(documents, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    isExist(hooks.beforeDeleteOne) ? await hooks.beforeDeleteOne(document, session) : undefined;
                    document = await this.dbService.deleteOne({_id: document._id, version: document.version}, {session}, {bearer: hooks.bearer});
                    isExist(hooks.afterDeleteOne) ? await hooks.afterDeleteOne(document, session) : undefined;

                    if (!hooks.isKeepForbiddenFields && isExist(document))
                    {
                        this.removeForbiddenPropertiesFromDocument(document);
                    }
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }

    async deleteOneByIdAndVersion (_id: ObjectId | string, version: number | string, externalSession?: ClientSession, hooks?: DeleteOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id);
        version = this.parseVersion(version);

        if (!isExist(_id) || !isExist(version))
        {
            throw new InvalidArgumentError();
        }

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(externalSession, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOne) ? await hooks.beforeReadOne(_id, version, session) : undefined;
                document = await this.dbService.readOne({_id, isSoftDeleted: false}, {session}, {bearer: hooks.bearer});
                isExist(hooks.afterReadOne) ? await hooks.afterReadOne(document, session) : undefined;

                this.checkDocumentSingularity(document, hooks.isRaiseDocumentExistenceErrors);

                if (isExist(document))
                {
                    this.checkVersion(document.version, version);

                    isExist(hooks.beforeDeleteOne) ? await hooks.beforeDeleteOne(document, session) : undefined;
                    document = await this.dbService.deleteOne({_id, version, isSoftDeleted: false}, {session}, {bearer: hooks.bearer});
                    isExist(hooks.afterDeleteOne) ? await hooks.afterDeleteOne(document, session) : undefined;

                    if (!hooks.isKeepForbiddenFields && isExist(document))
                    {
                        this.removeForbiddenPropertiesFromDocument(document);
                    }
                }
            },
            externalSession,
            internalSession
        );

        return document;
    }
}
