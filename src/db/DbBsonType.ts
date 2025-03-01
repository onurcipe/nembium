export default class DbBsonType
{
    private constructor () {}

    public static readonly BinaryData: string = "binData";
    public static readonly Boolean: string = "bool";
    public static readonly Int: string = "int"; // 32-bit integer number.
    public static readonly Double: string = "double"; // 64-bit IEEE 754-2008 binary floating point number.
    public static readonly String: string = "string"; // UTF-8 encoded string.
    public static readonly ObjectId: string = "objectId"; // small, likely unique, fast to generate, and ordered IDs.
    public static readonly Date: string = "date"; // 64-bit integer number, representing Epoch time.
    public static readonly Object: string = "object";
    public static readonly Array: string = "array";
}
