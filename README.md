\# Asset Management REST API



\## Overview

The Asset Management REST API is a backend application developed using Node.js, Express.js, Prisma ORM, and SQLite. It allows users to create, retrieve, update, and delete IT asset records.



\## Features

\- RESTful API architecture

\- CRUD operations for IT assets

\- SQLite database integration using Prisma ORM

\- Input validation

\- JSON request and response handling

\- Error handling for missing assets and duplicate records

\- API endpoint documentation

\- HTTP security headers using Helmet

\- Request logging using Morgan

\- Cross-Origin Resource Sharing (CORS) support



\## Technologies Used

\- Node.js

\- Express.js

\- Prisma ORM

\- SQLite

\- JavaScript

\- express-validator

\- Helmet

\- Morgan

\- CORS



\## Data Model: Asset



| Field | Type | Description |

|---|---|---|

| id | Integer | Unique asset identifier |

| assetTag | String | Unique asset tag |

| name | String | Asset name |

| category | String | Asset category |

| serialNumber | String | Unique serial number |

| status | String | Current asset status |

| purchaseCost | Float | Purchase cost |

| purchaseDate | DateTime | Purchase date |

| assignedTo | String, optional | Assigned employee |

| location | String | Asset location |

| isUnderWarranty | Boolean | Warranty status |

| notes | String, optional | Additional notes |

| createdAt | DateTime | Record creation time |

| updatedAt | DateTime | Last update time |



\## API Endpoints



Base URL: `http://localhost:3000`



| Method | Endpoint | Description |

|---|---|---|

| GET | `/` | API welcome message |

| POST | `/api/assets` | Create a new asset |

| GET | `/api/assets` | Retrieve all assets |

| GET | `/api/assets/:id` | Retrieve an asset by ID |

| PUT | `/api/assets/:id` | Update an existing asset |

| DELETE | `/api/assets/:id` | Delete an asset |

| GET | `/api/docs` | View API endpoint documentation |



\## Setup Instructions



\### Prerequisites

\- Node.js and npm installed



\### 1. Install dependencies

```bash

npm install

```



\### 2. Configure environment variables

Create a `.env` file in the project root:



```env

DATABASE\_URL="file:./dev.db"

```



\### 3. Create the database

```bash

npx prisma db push

```



\### 4. Generate Prisma Client

```bash

npx prisma generate

```



\### 5. Start the API

```bash

npm start

```



The API will run at `http://localhost:3000`.



\## API Documentation



Open `http://localhost:3000/api/docs` in your browser to view the available endpoints.



\## Testing



The following operations have been tested manually:

\- Creating an asset using POST

\- Retrieving assets using GET

\- Updating an asset using PUT

\- Deleting an asset using DELETE

\- Handling requests for nonexistent assets



\## Future Improvements

\- Add automated API tests

\- Integrate Swagger UI for interactive documentation

\- Improve validation for update requests

\- Add authentication and authorization



\## Author

Developed as part of YRTech Internship Task 3.

