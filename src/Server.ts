import {AddressInfo} from "node:net";
import http, {Server as HttpServer} from "node:http";
import https, {Server as HttpsServer} from "node:https";

import {Express} from "express";

import {isExist} from "./utility/value";
import DeveloperError from "./error/developer/DeveloperError";
import Logger from "./Logger";

export type Config =
    {
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
    }

export default class Server
{
    private readonly config?: Config;
    public readonly app: Express;

    private httpServer?: HttpServer;
    private httpsServer?: HttpsServer;

    public constructor (config: Config, app: Express)
    {
        this.config = config;
        this.app = app;
    }

    private handleListening (serverType: string, port: number): void
    {
        Logger.info(`${serverType} server is listening on port ${port}.`, 1);
    }

    private handleClose (server: string): void
    {
        Logger.info(`${server} server has been closed.`, 1);
    }

    public async create (): Promise<void>
    {
        if (!this.config.http.isEnabled && !this.config.https.isEnabled)
        {
            return;
        }

        Logger.info(`Creating server(s)...`, 2);

        if (this.config.http.isEnabled)
        {
            if (!isExist(this.config.http.port))
            {
                throw new DeveloperError("INVALID_CONFIG", "The provided configuration is invalid. Please specify the HTTP port.");
            }

            this.httpServer = http.createServer(this.app);
            Logger.info(`HTTP server has been created.`, 1);

            this.httpServer.on("listening", (): void => this.handleListening("HTTP", (this.httpServer.address() as AddressInfo).port));
            this.httpServer.on("close", (): void => this.handleClose("HTTP"));

            this.httpServer.listen(this.config.http.port);
        }

        if (this.config.https.isEnabled)
        {
            if (!isExist(this.config.https.port))
            {
                throw new DeveloperError("INVALID_CONFIG", "The provided configuration is invalid. Please specify the HTTPS port.");
            }

            if (!isExist(this.config.https.sslTlsCertificate))
            {
                throw new DeveloperError("INVALID_CONFIG", "The provided configuration is invalid. Please specify the SSL/TLS certificate.");
            }

            this.httpsServer = https.createServer(this.config.https.sslTlsCertificate, this.app);
            Logger.info(`HTTPS server has been created.`, 1);

            this.httpsServer.on("listening", (): void => this.handleListening("HTTPS", (this.httpsServer.address() as AddressInfo).port));
            this.httpsServer.on("close", (): void => this.handleClose("HTTPS"));

            this.httpsServer.listen(this.config.https.port);
        }
    }

    public async close (): Promise<void>
    {
        if (!isExist(this.httpServer) && !isExist(this.httpsServer))
        {
            return;
        }

        Logger.info(`Closing server(s)...`, 2);

        if (isExist(this.httpServer))
        {
            this.httpServer.close();
        }

        if (isExist(this.httpsServer))
        {
            this.httpsServer.close();
        }
    }
}
