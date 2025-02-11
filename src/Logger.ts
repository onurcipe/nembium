import {toUTCDateString} from "./utility/date";

export default class Logger
{
    private static isEnabled: boolean = false;
    private static level: number;

    private constructor () {}

    private static isLoggable (level: number): boolean
    {
        return Logger.isEnabled && level <= Logger.level;
    }

    private static generateLog (message: string): string
    {
        return `${toUTCDateString(Date.now())}: ${message}`;
    }

    public static enable (level: number): void
    {
        Logger.isEnabled = true;
        Logger.level = level;
    }

    public static info (message: string, level: number): void
    {
        if (Logger.isLoggable(level))
        {
            console.info(Logger.generateLog(message));
        }
    }

    public static warn (message: string, level: number): void
    {
        if (Logger.isLoggable(level))
        {
            console.warn(Logger.generateLog(message));
        }
    }

    public static error (message: string, level: number): void
    {
        if (Logger.isLoggable(level))
        {
            console.error(Logger.generateLog(message));
        }
    }
}
