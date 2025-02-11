import {ClientSession, WithTransactionCallback, TransactionOptions} from "mongodb";

import {isExist, initialize} from "../utility/value";
import Nembium from "../Nembium";

export default class DbSessionManager
{
    private constructor () {}

    /**
     * Starts a MongoDB session depending on the provided parameters.
     * 1) If an external session is specified, it does not start a new session since one has already started.
     * 2) If an external session is not specified:
     *   2.1) If forced to start a new session, starts a new one if it is not explicitly disabled by the hook.
     *   2.2) If not forced to start a new session, the hook decides it.
     *
     * @param externalSession - A session that has already started.
     * @param isEnabledByHook - A hook parameter that enables or disables starting a session.
     * @param isForced - A parameter that forces to start a session if not already started or explicitly disabled by the hook.
     */
    public static startSession (externalSession?: ClientSession, isEnabledByHook?: boolean, isForced?: boolean): {session?: ClientSession, internalSession?: ClientSession}
    {
        if (isExist(externalSession)) // 1
        {
            return {
                session: externalSession
            };
        }

        isForced = initialize(isForced, false);

        const isStartSession: boolean = isForced
                                        ? !(isExist(isEnabledByHook) && !isEnabledByHook) // 2.1
                                        : isExist(isEnabledByHook) && isEnabledByHook; // 2.2

        if (isStartSession)
        {
            const internalSession: ClientSession = Nembium.db.connection.startSession();

            return {
                session: internalSession,
                internalSession
            };
        }

        return {};
    }

    /**
     * Runs the provided callback depending on the provided parameters.
     * 1) If it runs with an external session, it means a session has started previously, so it must end where it began.
     * 2) If it runs with an internal session, it means a session has just started for the provided operation, so it runs the operation with the session using a transaction, which then ends.
     * 3) If no sessions are provided, executes the argument.
     *
     * This method should be an arrow argument since the `callback` must use the context it is called.
     */
    public static runWithSession = async (callback: WithTransactionCallback | Function, externalSession?: ClientSession, internalSession?: ClientSession, transactionOptions?: TransactionOptions): Promise<void> =>
    {
        transactionOptions = initialize(transactionOptions, {
            readConcern: {level: "majority"},
            writeConcern: {w: "majority"},
            readPreference: "primary"
        });

        if (isExist(externalSession)) // 1
        {
            await (callback as WithTransactionCallback)(externalSession);

            if (isExist(internalSession))
            {
                await internalSession.endSession();
            }
        }
        else
        {
            if (isExist(internalSession)) // 2
            {
                try
                {
                    await internalSession.withTransaction(callback as WithTransactionCallback, transactionOptions);
                }
                catch (error)
                {
                    throw error;
                }
                finally
                {
                    await internalSession.endSession();
                }
            }
            else // 3
            {
                await (callback as Function)();
            }
        }
    };
}
