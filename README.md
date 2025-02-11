# Nembium

Nembium is a **backend framework** for building applications with **Node.js**, **Express**, and **MongoDB**.

## 🔥 Why Use Nembium?

Building backend applications can be challenging.
You may find yourself spending too much time on repetitive tasks like managing, handling database connections, managing servers, validating requests, structuring services, managing dependencies, enforcing data types, and handling errors.

Nembium changes that for you.
It takes care of the complicated stuff so you can focus on what really matters—building your application.
With Nembium, you'll write clean, maintainable, and efficient code without the usual headaches.
Save time and build better applications today!

## 🧬 Features

Nembium follows a structured service-layer architecture, ensuring a clean separation of concerns and modular development.

- 📝 **Logging:** Easily monitor your application's activity with our simple logging system.
- 🌐 **Server Management:** Quickly manage your HTTP and HTTPS servers quickly using Express.
- 🗄️ **Database Connections:** Automate MongoDB connections with built-in lifecycle management so you can focus on your project.
- 🎛 **Database Interaction:** Simplify your work with MongoDB schemas, validation, and operations for a smoother coding experience.
- 🔒 **Transactions:** Ensure reliable database execution with all-or-nothing transactions and automatic session handling.
- 🗺️ **Versioning:** Prevent unintended overwrites by tracking document versions.
- 🥷 **Soft Deletion:** Hide deleted documents while keeping data intact.
- ⏳ **Timestamping:** Automatically track creation, update, and deletions.
- ⛔️ **Data Access Protection:** Restrict document fields based on user roles.
- 🗂️ **Layered Service Architecture:** Organize your backend with layered service-layer architecture and automatic dependency injection, providing separation of concerns and modular development.
- 🚦 **Request Validation:** Process and validate incoming requests quickly for a faster development experience.
- ⚠️ **Error Handling:** Manage errors easily with a system that catches and resolves issues centrally.
- 🔧 **Built-in Utilities:** Handle different data types and filesystem operations effortlessly with our helpful built-in tools.

## 🚀 Getting Started with Nembium

Starting with Nembium is quick and easy.
This section guides you on understanding Nembium and launching your first Nembium-powered application.

### 🗂️ Recommended Folder Structure

Using the following folder structure keeps your project organized and scalable.
This guide follows this structure.

```
src/
├─ index.ts
├─ middleware.ts
├─ db/
│  ├─ schema/
│  │  └─ ScientistDbSchema.ts
│  ├─ operation/
│  │  └─ ScientistDbOperation.ts
├─ service/
│  ├─ db/
│  │  └─ ScientistDbService.ts
│  ├─ application/
│  │  └─ ScientistApplicationService.ts
│  ├─ controller/
│  │  └─ ScientistControllerService.ts
├─ controller/
│  │  └─ ScientistController.ts
└─ route/
   ├─ index.ts
   └─ scientist.ts
```

### 📦 Installation

Install Nembium easily with npm.

```
npm install nembium
```

### 🔌 Starting the Application

To start your application, use `Nembium.launch`.

Create `/src/index.ts` as the entry point.

```
import path from "node:path";
import {Nembium} from "nembium";

const config = {
    log: {
        isEnabled: true,
        level: 3
    },
    dependencyInjector: {
        applicationService: path.join(__dirname, "service", "application")
    },
    db: {
        isEnabled: true,
        connection: {
            uri: "mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority&appName=your-app"
        }
    },
    server: {
        isEnabled: true,
        middleware: path.join(__dirname, "middleware.ts"),
        http: {
            isEnabled: true,
            port: 3000
        },
        https: {
            isEnabled: false
        }
    }
};

async function main ()
{
    await Nembium.launch(config);
}

main().catch(console.error);
```

### ⚙️ Configuration Options

Easily configure your app using the `config` parameter when you launch `Nembium`.

| Field                                       | Type                 | Description                                                                                                        |
|---------------------------------------------|----------------------|--------------------------------------------------------------------------------------------------------------------|
| `log`                                       | `object`             | Logger configurations.                                                                                             |
| `log.isEnabled`                             | `boolean`            | Enables or disables logging.                                                                                       |
| `log.level` <optional>                      | `number`             | Log level (higher values = more detailed logs). Required if logging is enabled.                                    |
| `db`                                        | `object`             | DB configurations.                                                                                                 |
| `db.isEnabled`                              | `boolean`            | Enables or disables the DB.                                                                                        |
| `db.connection` <optional>                  | `object`             | MongoDB connection details. Required if DB is enabled.                                                             |
| `db.connection.uri`                         | `string`             | [MongoDB connection URI.](https://www.mongodb.com/docs/manual/reference/connection-string/)                        |
| `db.connection.options` <optional>          | `MongoClientOptions` | [Additional MongoDB connection options.](https://www.mongodb.com/docs/manual/reference/connection-string-options/) |
| `server`                                    | `object`             | Server configurations.                                                                                             |
| `server.isEnabled`                          | `boolean`            | Enables or disables the server.                                                                                    |
| `server.middleware` <optional>              | `string`             | Path to the middleware module for Express.                                                                         |
| `server.http`                               | `object`             | HTTP server configurations.                                                                                        |
| `server.http.isEnabled`                     | `boolean`            | Enables or disables the HTTP server.                                                                               |
| `server.http.port` <optional>               | `number`             | HTTP server port. Required if the HTTP server is enabled.                                                          |
| `server.http`                               | `object`             | HTTPS server configurations.                                                                                       |
| `server.http.isEnabled`                     | `boolean`            | Enables or disables the HTTPS server.                                                                              |
| `server.http.port` <optional>               | `number`             | HTTPS server port. Required if the HTTPS server is enabled.                                                        |
| `server.https.sslTlsCertificate` <optional> | `object`             | SSL/TLS certificate configurations. Required if the HTTPS server is enabled.                                       |
| `server.https.sslTlsCertificate.key`        | `string`             | Path to the SSL/TLS private key file.                                                                              |
| `server.https.sslTlsCertificate.cert`       | `string`             | Path to the SSL/TLS certificate file.                                                                              |
| `server.https.sslTlsCertificate.ca`         | `string`             | Path to the SSL/TLS certificate authority file.                                                                    |
| `dependencyInjector` <optional>             | `object`             | Dependency injector.                                                                                               |
| `dependencyInjector.applicationService`     | `string`             | Path to the directory where the application service dependency injector will traverse.                             |

### 🧫 Customizing Express with Middleware

Customize Express by creating middleware and pointing it to `server.middleware` within the configuration.

Create the file `/src/middleware.ts`.

```
import {Express} from "express";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";

export default async (app: Express): Promise<void> =>
{
    /* Settings */
    // https://expressjs.com/en/api.html#app.set
    app.set("case sensitive routing", true);
    app.set("env", "production");
    app.set("strict routing", false);
    app.set("x-powered-by", false);

    /* Body Parser */
    // https://expressjs.com/en/resources/middleware/body-parser.html
    app.use(bodyParser.json({limit: "1mb"}));

    /* Compression */
    // https://expressjs.com/en/resources/middleware/compression.html
    app.use(compression());

    /* Setting HTTP Response Headers */
    // https://helmetjs.github.io
    app.use(helmet());

    /* CORS */
    // https://expressjs.com/en/resources/middleware/cors.html
    app.use(cors(
        {
            origin: "http://localhost:3000",
            credentials: true
        }
    ));
}
```

### 📄 Defining Database Schemas

`DbSchema` defines a [MongoDB schema](https://www.mongodb.com/docs/manual/data-modeling/) customized for Nembium.
It creates a foundation for versioning, soft deletion, timestamping, and persona-based data access protection.

`DbSchema` uses `DbBsonType`.
It encapsulates [BSON types](https://www.mongodb.com/docs/manual/reference/bson-types/), which are simply data types used in MongoDB.
It makes your life easier by hiding the complex names from you, providing you with the types you are familiar with.

Define your first database schema, `ScientistDbSchema` extending `DbSchema`, under `/src/db/schema`.

```
import {DbBsonType, DbSchema} from "nembium";

export default class ScientistDbSchema extends DbSchema
{
    public constructor ()
    {
        super(
            "test",
            "scientist",
            {
                isAddCommonProperties: true,
                isValidationEnabled: true
            },
            {
                bsonType: DbBsonType.Object,
                additionalProperties: false,
                required: ["bio"],
                properties: {
                    bio: {
                        bsonType: DbBsonType.Object,
                        required: ["name"],
                        properties: {
                            name: {
                                bsonType: DbBsonType.String
                            },
                            nationality: {
                                bsonType: DbBsonType.String,
                                forbiddenFromPersonas: ["USER"]
                            }
                        }
                    },
                    studyFields: {
                        bsonType: DbBsonType.Array,
                        items: {
                            bsonType: DbBsonType.String
                        }
                    },
                    awards: {
                        bsonType: DbBsonType.Array,
                        items: {
                            bsonType: DbBsonType.Object,
                            additionalProperties: false,
                            required: ["name"],
                            properties: {
                                name: {
                                    bsonType: DbBsonType.String
                                },
                                year: {
                                    bsonType: DbBsonType.Int
                                }
                            }
                        }
                    },
                    knownFor: {
                        bsonType: DbBsonType.String
                    }
                }
            }
        );
    }
}
```

### ⚙️ Handling Database Operations

`DbOperation` handles database operations using the MongoDB driver.
It encapsulates MongoDB operations to simplify usage, making it easier to work with, hiding complexities, and managing MongoDB-specific nuances.

`DbOperation` uses `DbSchema` to access its corresponding MongoDB collection.

Handle database operations for your first database schema under `/src/db/operation` by implementing `ScientistDbOperation`, which extends `DbOperation`.

```
import {DbOperation} from "nembium";
import ScientistDbSchema from "../schema/ScientistDbSchema";

export default class ScientistDbOperation extends DbOperation
{
    public constructor ()
    {
        super(new ScientistDbSchema());
    }
}
```

### 🛠 Implementing Main Logic with Layered Services

#### 🗄️ Database Service

`DbService` is the lowest-level service layer (below the application layer), responsible for handling database interactions via `DbOperation`.

It supports transactional operations and customizations via hooks.

- 🔒 **Transactional Operations:** Transactions provide all-or-nothing code execution where database operations either fully complete or fully revert in case of failure. It is used when changes in one document depend on changes in another. For example, when transferring funds from one person to another, the process first reduces the amount from one document before increasing it in the other. If an error occurs in the middle of these two operations, transactions ensure that all operations are reverted to maintain consistency across the documents.
- 🪝 **Customization via Hooks:** Hooks enable you to override functions without needing to rewrite the entire logic. Instead, you can customize the specific code line where the hook is attached. For example, you might use a hook to check another document before an update operation or modify another document after the operation is complete.

Build your first database service under `/src/service/db` by implementing `ScientistDbService`, which extends `DbService`.

```
import {DbService} from "nembium";
import ScientistDbOperation from "../../db/operation/ScientistDbOperation";

export default class ScientistDbService extends DbService
{
    constructor ({persona}: {persona?: string})
    {
        super({dbOperation: new ScientistDbOperation(), persona});
    }
}
```

#### 🧠 Application Service

`ApplicationService` is the mid-level service layer (between the database and controller layers) responsible for handling the business logic.
It uses `DbService` to access the database.

It supports transactional operations, customizations via hooks, versioning, soft deletion, timestamping, and persona-based data access protection.

- 🔒 **Transactional Operations:** Transactions provide all-or-nothing code execution where database operations either fully complete or fully revert in case of failure. It is used when changes in one document depend on changes in another. For example, when transferring funds from one person to another, the process first reduces the amount from one document before increasing it in the other. If an error occurs in the middle of these two operations, transactions ensure that all operations are reverted to maintain consistency across the documents.
- 🪝 **Customization via Hooks:** Hooks enable you to override functions without needing to rewrite the entire logic. Instead, you can customize the specific code line where the hook is attached. For example, you might use a hook to check another document before an update operation or modify another document after the operation is complete.
- 🗺️ **Versioning:** It ensures that any changes made to the document update its version, which prevents unintended overwrites. For example, if more than one person is working on the same document, versioning prevents them from submitting their work simultaneously. Once one person submits their changes, the other person will be unable to submit their work until the first person's changes have been fetched on their side. Similarly, if a single user has multiple screens open, any changes made on one screen will prevent the other screens from updating.
- 🥷 **Soft Deletion:** It allows documents to be marked as deleted without physically removing them from the database, keeping them hidden from users. This feature allows data to be stored for regulatory purposes.
- ⏳ **Timestamping:** It attaches timestamps to documents to track when they were created, last updated, and soft deleted.
- ⛔️ **Persona-Based Data Access Protection:** It allows documents to have fields that are restricted for certain personas (user roles). When a user accesses a document, the application service layer removes forbidden fields. For example, both an employee and an employer may access the same document, but the salary information is omitted from the employee's view.

Build your first application service under `/src/service/application` by implementing `ScientistApplicationService`, which extends `ApplicationService`.

You can set up `DependencyInjector` pointing to this directory in `dependencyInjector.applicationService` in your app config.
You can inject any application service by simply providing the name of the class you want to inject along with the parameters.

```
import {ApplicationService} from "nembium";
import ScientistDbService from "../db/ScientistDbService";

export default class ScientistApplicationService extends ApplicationService
{
    // public userApplicationService: ApplicationService;

    constructor ({persona, isRaiseDocumentExistenceErrors}: {persona?: string, isRaiseDocumentExistenceErrors?: boolean})
    {
        super({dbService: new ScientistDbService({persona}), persona, isRaiseDocumentExistenceErrors});
    }
    
    // this.userApplicationService = Nembium.applicationServiceDI.inject("UserApplicationService", [{persona}], this, [...arguments]);
}
```

#### 🎛 Controller Service

`ControllerService` is the highest-level service layer (above the application layer) and serves as the entry point for controllers.
It uses `ApplicationService` to complete its tasks.

It supports transactional operations and customizations via hooks.

- 🔒 **Transactional Operations:** Transactions provide all-or-nothing code execution where database operations either fully complete or fully revert in case of failure. It is used when changes in one document depend on changes in another. For example, when transferring funds from one person to another, the process first reduces the amount from one document before increasing it in the other. If an error occurs in the middle of these two operations, transactions ensure that all operations are reverted to maintain consistency across the documents.
- 🪝 **Customization via Hooks:** Hooks enable you to override functions without needing to rewrite the entire logic. Instead, you can customize the specific code line where the hook is attached. For example, you might use a hook to check another document before an update operation or modify another document after the operation is complete.

Build your first controller service under `/src/service/controller` by implementing `ScientistControllerService`, which extends `ControllerService`.

```
import {ControllerService} from "nembium";
import ScientistApplicationService from "../application/ScientistApplicationService";

class ScientistControllerService extends ControllerService
{
    public constructor ()
    {
        const persona: string = "USER";
        super({applicationService: new ScientistApplicationService({persona, isRaiseDocumentExistenceErrors: true}), persona});
    }
}

export default ScientistControllerService;
```

### 🎮 Handling Requests with Controller

`Controller` is responsible for parsing client requests, initiating service logic, and responding with structured data.

Build your first controller under `/src/controller` by implementing `ScientistController`, which extends `Controller`.

```
import {Controller} from "nembium";
import ScientistControllerService from "../service/controller/ScientistControllerService";

export default class ScientistController extends Controller
{
    public constructor ()
    {
        super(new ScientistControllerService());
    }
}
```

### 📡 Creating API Endpoints with Routes

APIs expose application functionality via endpoints.

Define request schemas to validate incoming requests automatically.
Supported data types are `"Boolean"`, `"Number"`, `"String"`, `"ObjectId"`, and `"Date"`.
Fields that are optional begin with a `.`.

Create your first API endpoint for CRUD operations under `/src/route/scientist.ts`.

| Endpoint                                 | Method | Description                    |
|------------------------------------------|--------|--------------------------------|
| `/scientist/read`                        | `POST` | Read multiple scientists       |
| `/scientist/readOneById`                 | `POST` | Read a single scientist        |
| `/scientist/createOne`                   | `POST` | Create a scientist             |
| `/scientist/updateOneByIdAndVersion`     | `POST` | Update a scientist             |
| `/scientist/softDeleteOneByIdAndVersion` | `POST` | Soft delete a scientist        |
| `/scientist/deleteOneByIdAndVersion`     | `POST` | Permanently delete a scientist |

```
import ScientistController from "../controller/ScientistController";

const userFootballGameController: ScientistController = new ScientistController();

const router: any = ScientistController.createRouter({caseSensitive: true, mergeParams: true, strict: false});

router.route("/read").post(
    (request: any, response: any, next: any): Promise<void> =>
        userFootballGameController.read(
            request, response, next,
            {
                headers: {
                    presence: "allowed-optional",
                    definition: "*"
                },
                pathParameters: {
                    presence: "forbidden"
                },
                queryString: {
                    presence: "forbidden"
                },
                body: {
                    presence: "allowed-required",
                    definition: {
                        "query": {
                            ".bio": {
                                ".name": "String",
                                ".nationality": "String"
                            },
                            ".studyFields": ["String"],
                            ".awards": [
                                {
                                    ".name": "String",
                                    ".year": "Number"
                                }
                            ],
                            ".knownFor": "String"
                        },
                        "options": {
                            ".limit": "Number",
                            ".skip": "Number",
                            ".sort": {
                                ".bio": {
                                    ".name": "Number",
                                    ".nationality": "Number"
                                }
                            }
                        }
                    }
                }
            }
        )
);

router.route("/readOneById").post(
    (request: any, response: any, next: any): Promise<void> =>
        userFootballGameController.readOneById(
            request, response, next,
            {
                headers: {
                    presence: "allowed-optional",
                    definition: "*"
                },
                pathParameters: {
                    presence: "forbidden"
                },
                queryString: {
                    presence: "forbidden"
                },
                body: {
                    presence: "allowed-required",
                    definition: {
                        "_id": "ObjectId"
                    }
                }
            }
        )
);

router.route("/createOne").post(
    (request: any, response: any, next: any): Promise<void> =>
        userFootballGameController.createOne(
            request, response, next,
            {
                headers: {
                    presence: "allowed-optional",
                    definition: "*"
                },
                pathParameters: {
                    presence: "forbidden"
                },
                queryString: {
                    presence: "forbidden"
                },
                body: {
                    presence: "allowed-required",
                    definition: {
                        "documentData": {
                            "bio": {
                                "name": "String",
                                ".nationality": "String"
                            },
                            ".studyFields": ["String"],
                            ".awards": [
                                {
                                    ".name": "String",
                                    ".year": "Number"
                                }
                            ],
                            ".knownFor": "String"
                        }
                    }
                }
            }
        )
);

router.route("/updateOneByIdAndVersion").post(
    (request: any, response: any, next: any): Promise<void> =>
        userFootballGameController.updateOneByIdAndVersion(
            request, response, next,
            {
                headers: {
                    presence: "allowed-optional",
                    definition: "*"
                },
                pathParameters: {
                    presence: "forbidden"
                },
                queryString: {
                    presence: "forbidden"
                },
                body: {
                    presence: "allowed-required",
                    definition: {
                        "_id": "ObjectId",
                        "version": "Number",
                        "documentData": {
                            ".bio": {
                                ".name": "String",
                                ".nationality": "String"
                            },
                            ".studyFields": ["String"],
                            ".awards": [
                                {
                                    ".name": "String",
                                    ".year": "Number"
                                }
                            ],
                            ".knownFor": "String"
                        }
                    }
                }
            }
        )
);

router.route("/softDeleteOneByIdAndVersion").post(
    (request: any, response: any, next: any): Promise<void> =>
        userFootballGameController.softDeleteOneByIdAndVersion(
            request, response, next,
            {
                headers: {
                    presence: "allowed-optional",
                    definition: "*"
                },
                pathParameters: {
                    presence: "forbidden"
                },
                queryString: {
                    presence: "forbidden"
                },
                body: {
                    presence: "allowed-required",
                    definition: {
                        "_id": "ObjectId",
                        "version": "Number"
                    }
                }
            }
        )
);

router.route("/deleteOneByIdAndVersion").post(
    (request: any, response: any, next: any): Promise<void> =>
        userFootballGameController.deleteOneByIdAndVersion(
            request, response, next,
            {
                headers: {
                    presence: "allowed-optional",
                    definition: "*"
                },
                pathParameters: {
                    presence: "forbidden"
                },
                queryString: {
                    presence: "forbidden"
                },
                body: {
                    presence: "allowed-required",
                    definition: {
                        "_id": "ObjectId",
                        "version": "Number"
                    }
                }
            }
        )
);

export default router;
```

Create the entry point for your API endpoint using `/src/route/index.ts`.

```
import {Controller} from "nembium";
import scientist from "./scientist";

const router: any = Controller.createRouter({caseSensitive: true, mergeParams: true, strict: false});
router.use("/scientist", scientist);

export default router;
```

Customize further your middleware to serve your API.

```
import {Express} from "express";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import {BadRequestError, Logger} from "nembium";
import router from "./route/index";

export default async (app: Express): Promise<void> =>
{
    /* Settings */
    // https://expressjs.com/en/api.html#app.set
    app.set("case sensitive routing", true);
    app.set("env", "production");
    app.set("strict routing", false);
    app.set("x-powered-by", false);

    /* Body Parser */
    // https://expressjs.com/en/resources/middleware/body-parser.html
    app.use(bodyParser.json({limit: "1mb"}));

    /* Compression */
    // https://expressjs.com/en/resources/middleware/compression.html
    app.use(compression());

    /* Setting HTTP Response Headers */
    // https://helmetjs.github.io
    app.use(helmet());

    /* CORS */
    // https://expressjs.com/en/resources/middleware/cors.html
    app.use(cors(
        {
            origin: "http://localhost:3000",
            credentials: true
        }
    ));

    /* Serve API */
    app.get("/ok", (request: any, response: any): void => {response.status(200).send("OK");});
    app.use(router);
    app.use((error: any, request: any, response: any, next: any): void =>
            {
                Logger.error(error, 3);
                const errorResponse: any = new BadRequestError();
                response.status(errorResponse.statusCode).json({statusCode: errorResponse.statusCode, message: errorResponse.message});
            }
    );
}
```

🎉 Congratulations! Your app is ready to accept its first request.
You can read the source code or contact me for further guidance.

## 🏗️ Architecture

### 🗺️ Class Diagram

```
Logger
Interceptor
Db → Logger
Server → Logger
DependencyInjector
Nembium → Logger, Db, Server, Interceptor, DependencyInjector

DbBsonType
DbSchema → Nembium, DbBsonType
DbOperation → DbSchema
DbSessionManager -> Nembium

BaseService -> DbBsonType, DbSchema
DbService (BaseService) -> DbSchema, DbOperation, DbSessionManager
ApplicationService (BaseService) -> DbBsonType, DbSchema, DbOperation, DbSessionManager, DbService
ControllerService (BaseService) -> DbSchema, DbOperation, DbSessionManager, DbService, ApplicationService

BaseController
Controller (BaseController)
```

**Brackets Notation:** `()` indicates class inheritance, meaning the class inside the parentheses extends the class before it.

`A (B)` means `A` inherits from (has all the functionality of) `B`.

**Arrow Notation:** `→` indicates class dependencies, meaning the class before the arrow depends on the class after it.

`A → B, C` means `A` depends on (uses) `B` and `C`.

### 🌊 Data Flow Diagram

```
Client ─|→ Server
        |  └─ Express.Router via Middleware
        |     └─ Controller
        |        └─ ControllerService
        |           └─ ApplicationService
        |              └─ DbService
        |                 └─ DbOperation
        |                    └─ DbSchema
        |                       └─ Db
        |                          └─ MongoDB.Collection → MongoDB Server
```

### ⚠️ Errors

`DeveloperError` occurs when Nembium is misused.

`DbError` represents errors related to MongoDB interactions. These are distinct from MongoDB's internal errors.

`HttpError` is for errors intended to be returned as HTTP responses.

```
BaseError
├─ DeveloperError
│  ├─ InvalidArgumentError
│  ├─ FileNotFoundError
│  └─ DirectoryNotFoundError
├─ DbError
│  ├─ DocumentNotFoundError
│  └─ MoreThan1DocumentFoundError
└─ HttpError
   ├─ ClientError
   │  ├─ BadRequestError
   │  ├─ UnauthorizedError
   │  ├─ ForbiddenError
   │  └─ NotFoundError
   └─ ServerError
      └─ InternalServerError
```

## 📜 License

Nembium is licensed under the [MIT License](LICENSE).
