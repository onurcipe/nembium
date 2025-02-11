import {MongoClient, MongoClientOptions} from "mongodb";

import Logger from "./Logger";

export default class Db
{
    public readonly connection: MongoClient;

    public constructor (connection: {uri: string, options?: MongoClientOptions})
    {
        this.connection = new MongoClient(connection.uri, connection?.options);
    }

    async connect (): Promise<void>
    {
        Logger.info(`Connecting to DB...`, 2);
        await this.connection.connect();
        Logger.info(`DB has been connected.`, 1);
    }

    async disconnect (): Promise<void>
    {
        Logger.info("Closing DB connection...", 2);
        await this.connection.close();
        Logger.info("DB has been disconnected.", 1);
    }
}
