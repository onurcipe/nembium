import {ClientSession, ObjectId, Document} from "mongodb";

import {isExist, initialize} from "../utility/value";
import InvalidArgumentError from "../error/developer/argument/InvalidArgumentError";
import DbSchema from "../db/DbSchema";
import DbOperation, {DocumentData} from "../db/DbOperation";
import DbSessionManager from "../db/DbSessionManager";
import BaseService from "./BaseService";
import DbService, {Query} from "./DbService";
import ApplicationService, {ReadOptions} from "./ApplicationService";

export type Options<S extends DbSchema = DbSchema, DBO extends DbOperation<S> = DbOperation<S>, DBS extends DbService<S, DBO> = DbService<S, DBO>, AS extends ApplicationService<S, DBO, DBS> = ApplicationService<S, DBO, DBS>> =
    {
        schema?: S;
        dbOperation?: DBO;
        dbService?: DBS;
        applicationService?: AS;
        persona?: string;
        isRaiseDocumentExistenceErrors?: boolean;
    }

export type ReadHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeRead?: (query: Query, options: ReadOptions, session?: ClientSession) => Promise<void>;
        afterCount?: (documents: Document[], count: number, session?: ClientSession) => Promise<void>;
    }

export type ReadOneByIdHooks =
    {
        isSessionEnabled?: boolean;
        isRaiseDocumentExistenceErrors?: boolean;
        bearer?: any;
        beforeReadOneById?: (_id: ObjectId, session?: ClientSession) => Promise<void>;
        afterReadOneById?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type CreateOneHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeCreateOne?: (documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterCreateOne?: (document: Document, session?: ClientSession) => Promise<void>;
    }

export type UpdateOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeUpdateOneByIdAndVersion?: (_id: ObjectId, version: number, documentData: DocumentData, session?: ClientSession) => Promise<void>;
        afterUpdateOneByIdAndVersion?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type SoftDeleteOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeSoftDeleteOneByIdAndVersion?: (_id: ObjectId, version: number, session?: ClientSession) => Promise<void>;
        afterSoftDeleteOneByIdAndVersion?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

export type DeleteOneByIdAndVersionHooks =
    {
        isSessionEnabled?: boolean;
        bearer?: any;
        beforeDeleteOneByIdAndVersion?: (_id: ObjectId, version: number, session?: ClientSession) => Promise<void>;
        afterDeleteOneByIdAndVersion?: (document: Document | null, session?: ClientSession) => Promise<void>;
    }

class ControllerService<S extends DbSchema = DbSchema, DBO extends DbOperation<S> = DbOperation<S>, DBS extends DbService<S, DBO> = DbService<S, DBO>, AS extends ApplicationService<S, DBO, DBS> = ApplicationService<S, DBO, DBS>> extends BaseService
{
    public readonly applicationService: AS;

    public constructor (options: Options<S, DBO, DBS, AS>)
    {
        super(BaseService.LAYER.CONTROLLER, options.persona);

        if (isExist(options.schema) && !isExist(options.dbOperation) && !isExist(options.dbService) && !isExist(options.applicationService))
        {
            this.applicationService = new ApplicationService({schema: options.schema, persona: options.persona, isRaiseDocumentExistenceErrors: options.isRaiseDocumentExistenceErrors}) as AS;
        }
        else if (!isExist(options.schema) && isExist(options.dbOperation) && !isExist(options.dbService) && !isExist(options.applicationService))
        {
            this.applicationService = new ApplicationService({dbOperation: options.dbOperation, persona: options.persona, isRaiseDocumentExistenceErrors: options.isRaiseDocumentExistenceErrors}) as AS;
        }
        else if (!isExist(options.schema) && !isExist(options.dbOperation) && isExist(options.dbService) && !isExist(options.applicationService))
        {
            this.applicationService = new ApplicationService({dbService: options.dbService, persona: options.persona, isRaiseDocumentExistenceErrors: options.isRaiseDocumentExistenceErrors}) as AS;
        }
        else if (!isExist(options.schema) && !isExist(options.dbOperation) && !isExist(options.dbService) && isExist(options.applicationService))
        {
            this.applicationService = options.applicationService;
        }
        else
        {
            throw new InvalidArgumentError();
        }
    }

    public async read (query: Query, options?: ReadOptions, hooks?: ReadHooks): Promise<{documents: Document[], count: number}>
    {
        options = initialize(options, {});
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        query = this.parse(query, this.applicationService.dbService.dbOperation.schema.definition);

        let documents: Document[];
        let count: number = 0;
        const {session, internalSession} = DbSessionManager.startSession(undefined, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeRead) ? await hooks.beforeRead(query, options, session) : undefined;
                documents = await this.applicationService.read(query, options, session, {bearer: hooks.bearer});
                count = await this.applicationService.count(query, options, session, {bearer: hooks.bearer});
                isExist(hooks.afterCount) ? await hooks.afterCount(documents, count, session) : undefined;
            },
            undefined,
            internalSession
        );

        return {
            documents,
            count
        };
    }

    public async readOneById (_id: string | ObjectId, hooks?: ReadOneByIdHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id, true);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(undefined, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeReadOneById) ? await hooks.beforeReadOneById(_id, session) : undefined;
                document = await this.applicationService.readOneById(_id, session, {bearer: hooks.bearer});
                isExist(hooks.afterReadOneById) ? await hooks.afterReadOneById(document, session) : undefined;
            },
            undefined,
            internalSession
        );

        return document;
    }

    public async createOne (documentData: DocumentData, hooks?: CreateOneHooks): Promise<Document>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        documentData = this.parse(documentData, this.applicationService.dbService.dbOperation.schema.definition);

        let document: Document;
        const {session, internalSession} = DbSessionManager.startSession(undefined, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeCreateOne) ? await hooks.beforeCreateOne(documentData, session) : undefined;
                document = await this.applicationService.createOne(documentData, session, {bearer: hooks.bearer});
                isExist(hooks.afterCreateOne) ? await hooks.afterCreateOne(document, session) : undefined;
            },
            undefined,
            internalSession
        );

        return document;
    }

    public async updateOneByIdAndVersion (_id: string | ObjectId, version: string | number, documentData: DocumentData, hooks?: UpdateOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id, true);
        version = this.parseVersion(version, true);

        documentData = this.parse(documentData, this.applicationService.dbService.dbOperation.schema.definition);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(undefined, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeUpdateOneByIdAndVersion) ? await hooks.beforeUpdateOneByIdAndVersion(_id, version, documentData, session) : undefined;
                document = await this.applicationService.updateOneByIdAndVersion(_id, version, documentData, session, {bearer: hooks.bearer});
                isExist(hooks.afterUpdateOneByIdAndVersion) ? await hooks.afterUpdateOneByIdAndVersion(document, session) : undefined;
            },
            undefined,
            internalSession
        );

        return document;
    }

    public async softDeleteOneByIdAndVersion (_id: string | ObjectId, version: string | number, hooks?: SoftDeleteOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id, true);
        version = this.parseVersion(version, true);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(undefined, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeSoftDeleteOneByIdAndVersion) ? await hooks.beforeSoftDeleteOneByIdAndVersion(_id, version, session) : undefined;
                document = await this.applicationService.softDeleteOneByIdAndVersion(_id, version, session, {bearer: hooks.bearer});
                isExist(hooks.afterSoftDeleteOneByIdAndVersion) ? await hooks.afterSoftDeleteOneByIdAndVersion(document, session) : undefined;
            },
            undefined,
            internalSession
        );

        return document;
    }

    public async deleteOneByIdAndVersion (_id: string | ObjectId, version: string | number, hooks?: DeleteOneByIdAndVersionHooks): Promise<Document | null>
    {
        hooks = initialize(hooks, {});
        hooks.bearer = initialize(hooks.bearer, {});

        _id = this.parseObjectId(_id, true);
        version = this.parseVersion(version, true);

        let document: Document | null;
        const {session, internalSession} = DbSessionManager.startSession(undefined, hooks.isSessionEnabled);
        await DbSessionManager.runWithSession(
            async (): Promise<void> =>
            {
                isExist(hooks.beforeDeleteOneByIdAndVersion) ? await hooks.beforeDeleteOneByIdAndVersion(_id, version, session) : undefined;
                document = await this.applicationService.deleteOneByIdAndVersion(_id, version, session, {bearer: hooks.bearer});
                isExist(hooks.afterDeleteOneByIdAndVersion) ? await hooks.afterDeleteOneByIdAndVersion(document, session) : undefined;
            },
            undefined,
            internalSession
        );

        return document;
    }
}

export default ControllerService;
