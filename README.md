# SAE Documentation Bridge

The User Guide Bridge is a simple microservice designed to route formatted help document requests from a content provider to a user interface.

Currently it is designed for one source of truth for content, but can be expanded to route different sources.

## Usage

For apps that serve to provide documentation to all users, make a request to `/article`. See[Documize API](https://docs.documize.com/s/WtXNJ7dMOwABe2UK/api) for examples of what the request response looks like.

```javascript
// Route parameters are /article/:app/:type
const req = request('https://usebridge.url/api/v1/article/bbsae/onboarding');

// Optionally specify a role if different user types require access to different content
const req = request('https://usebridge.url/api/v1/article/ocwa/onboarding?role=exporter');

```

#### Content

Currently the application uses a single API for consuming content (Documeize) and utilizes tags for finding content, so content needed for your application should contain tags that match the API's requests

```
Tags:           ocwa onboarding      exporter
                  |      |               |
/api/v1/article/ocwa/onboarding/role=exporter
```

## Installation

### Prerequisites

- Node 12 or newer
- Docker 18.09.1 or newer

### Bare Metal Install

Create a `default.json` file from `default.json.template` under the config directory and edit the values to ones for your environment. See configuration options below.

Run `$ npm install` to install dependencies.

Run `$ npm start` to run the development version of the server. Nodemon is used to restart the server on file changes.

### Production

Create a `production.json` from `production.json.template` and configure the values for your environment.

Run `npm run start:prod` to run the production configured server.

### Configuration Options

| Value                                                                       | Property       |
|-----------------------------------------------------------------------------|----------------|
| The host URL of the target API, e.g. `https://helpapi.com/api`              | `host`         |
| The port for Express to run on                                              | `port`         |
| The API auth token required to connect to the API                           | `token`        |
| An array of application names (generally tags)                              | `applications` |
| The [debug](https://www.npmjs.com/package/morgan) namespace for logging     | `logLevel`     |
| The format level for [Morgan](https://www.npmjs.com/package/morgan)         | `morganFormat` |
| An array of whitelisted UI urls, for CORS, e.g. `["http://localhost:8080"]` | `whitelist`    |

## Developer Guidelines

This project uses Eslint for linting, Prettier for code formatting and Jest for testing. It is recommended for continuity and to lighten the number of lines of code added to a Git commit that these plugins are enabled in your IDE of choice.
