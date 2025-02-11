import fs, {Stats} from "node:fs";

import FileNotFoundError from "../error/developer/filesystem/FileNotFoundError";

/**
 * Checks if the provided path points to an accessible file and throws an error if not.
 */
export function validateFile (path: string): void
{
    if (!fs.existsSync(path))
    {
        throw new FileNotFoundError("PATH_NOT_EXIST", "The specified path ($0) does not exist.", path);
    }

    const pathInformation: Stats = fs.lstatSync(path);

    if (!pathInformation.isFile())
    {
        throw new FileNotFoundError("NOT_A_FILE", "The specified path ($0) exists but does not point to a file.", path);
    }

    try
    {
        fs.accessSync(path, fs.constants.F_OK | fs.constants.R_OK);
    }
    catch (error)
    {
        throw new FileNotFoundError("FILE_NOT_ACCESSIBLE", "The specified file at the path ($0) exists but is not accessible.", path);
    }
}

/**
 * Checks if the provided path points to an accessible directory and throws an error if not.
 */
export function validateDirectory (path: string): void
{
    if (!fs.existsSync(path))
    {
        throw new FileNotFoundError("PATH_NOT_EXIST", "The specified path ($0) does not exist.", path);
    }

    const pathInformation: Stats = fs.lstatSync(path);

    if (!pathInformation.isDirectory())
    {
        throw new FileNotFoundError("NOT_A_DIRECTORY", "The specified path ($0) exists but does not point to a directory.", path);
    }

    try
    {
        fs.accessSync(path, fs.constants.F_OK | fs.constants.R_OK);
    }
    catch (error)
    {
        throw new FileNotFoundError("DIRECTORY_NOT_ACCESSIBLE", "The specified directory at the path ($0) exists but is not accessible.", path);
    }
}

