import process from "node:process";

import express, {Express} from "express";
import {MongoClientOptions} from "mongodb";

import {isExist} from "./utility/value";
import Logger from "./Logger";
import Db from "./Db";
import Server from "./Server";
import Interceptor from "./Interceptor";
import DependencyInjector from "./DependencyInjector";

export type Config =
    {
        log: {
            isEnabled: boolean
            level?: number
        };
        db: {
            isEnabled: boolean
            connection?: {
                uri: string
                options?: MongoClientOptions
            };
        };
        server: {
            isEnabled: boolean
            middleware?: string
            http: {
                isEnabled: boolean
                port?: number
            };
            https: {
                isEnabled: boolean
                port?: number
                sslTlsCertificate?: {
                    key: string
                    cert: string
                    ca: string
                };
            };
        };
        dependencyInjector?: {
            applicationService: string
        };
    }

export default class Nembium
{
    public static db: Db;
    public static server: Server;
    public static applicationServiceDI: DependencyInjector;

    private constructor () {}

    private static async shutdown (exitCode: number): Promise<void>
    {
        Logger.info("Shutting Nembium down...", 2);

        try
        {
            if (isExist(Nembium.db))
            {
                await Nembium.db.disconnect();
            }

            if (Nembium.server)
            {
                await Nembium.server.close();
            }

            Logger.info("Nembium has been shut down gracefully.", 1);
        }
        catch (error)
        {
            const errorMessage: string = isExist(error.toString) ? error.toString() : JSON.stringify(error);
            Logger.error(`An error has occurred during shutdown. Error: ${errorMessage}`, 0);
            exitCode = 1;
        }
        finally
        {
            Logger.info("Exiting...", 1);
            process.exit(exitCode);
        }
    }

    private static async handleUncaughtException (error: Error, origin: string): Promise<void>
    {
        Logger.error(`An uncaught exception has occurred at "${origin}". Error: ${error.stack}`, 0);

        await Nembium.shutdown(1);
    }

    private static async handleUnhandledRejection (reason: Error | any, promise: Promise<any>): Promise<void>
    {
        Logger.error(`An unhandled rejection has occurred at "${promise}". ${reason.stack || reason.callStack}`, 0);

        await Nembium.shutdown(1);
    }

    private static async handleProcessTerminateSignals (): Promise<void>
    {
        await Nembium.shutdown(0);
    }

    public static async launch (config: Config): Promise<void>
    {
        if (config.log.isEnabled)
        {
            Logger.enable(config.log.level);
        }

        Logger.info(`Launching Nembium...`, 2);

        process.on("uncaughtException", Nembium.handleUncaughtException); // https://nodejs.org/api/process.html#event-uncaughtexception
        process.on("unhandledRejection", Nembium.handleUnhandledRejection); // https://nodejs.org/api/process.html#event-unhandledrejection
        process.on("SIGINT", Nembium.handleProcessTerminateSignals);
        process.on("SIGTERM", Nembium.handleProcessTerminateSignals);

        if (isExist(config.dependencyInjector))
        {
            Logger.info(`Setting up dependency injector...`, 2);
            Nembium.applicationServiceDI = new DependencyInjector(config.dependencyInjector.applicationService);
            Logger.info(`Dependency injector is ready to use.`, 1);
        }

        if (config.db.isEnabled)
        {
            const db = new Db({uri: config.db.connection.uri, options: config.db.connection?.options});
            await db.connect();
            Nembium.db = db;
        }

        if (config.server.isEnabled)
        {
            Logger.info(`Launching Express app...`, 2);
            const app: Express = express();
            Logger.info(`Express app has been launched.`, 1);

            if (isExist(config.server.middleware))
            {
                Logger.info(`Setting up Express middleware...`, 2);
                const interceptor = new Interceptor(config.server.middleware);
                await interceptor.execute(app);
                Logger.info(`Express middleware has been set up.`, 1);
            }

            const server = new Server({http: config.server.http, https: config.server.https}, app);
            await server.create();
            Nembium.server = server;
        }

        Logger.info(`Nembium has been launched.`, 1);
    }
}
