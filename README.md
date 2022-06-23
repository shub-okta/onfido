**NOTE: This is an example only and should not be used in any production environment.**

# Auth0 + Onfido Sample Rule App

This is an EXAMPLE app to show how organization can leverage Auth0's Rule engine and Onfido's Identity Verification (IdV) service to provide strongly validated identities to your application.

Read more about Auth0's Rules [here](https://auth0.com/docs/rules).

Read more about Onfido's Identity Verification [here](https://onfido.com/).


# What this repo provides

This repo provides a sample Auth0 rule (`/rules-sample`) to redirect a user during authentication to an application that is leveraging Onfido's Input Capture SDK ([https://github.com/onfido/onfido-sdk-ui](https://github.com/onfido/onfido-sdk-ui)) and APIs ([https://documentation.onfido.com/](https://documentation.onfido.com/)) to process a IdV check.

Additionally, this repo offers an example implementation of the application leveraging Onfido's Input Capture SDK  and APIs.


## Building the Example
First set the environment variables (sample found in `env/.sample.env`):

    APP_SECRET=LONG RANDOM STRING - This should mirror the SESSION_TOKEN_SECRET in the Auth0 rule configuration.
    ISSUER_BASE_URL=https://AUTH0_DOMAIN - this should be the URL the redirect is coming from, your auth0 domain.
    APP_URL=http://localhost - the host running this example app
    PORT=3000 - the port the example app should run on
    ONFIDO_API_TOKEN=sometokenvalue - this is an Onfido API Token obtained from your Onfido dashboard
    ONFIDO_REGION=EU - this is the region your Onfido isntance is running in: EU, US, CA
    ONFIDO_REFERRER_PATTER=*://*/ - this is the referrer pattern for the Onfido SDK token to match, see: https://documentation.onfido.com/#generate-sdk-token
    ONFIDO_REPORT_NAMES=document,facial_similarity_photo - this is the Onfido reports to run for the user, see: https://documentation.onfido.com/#report-names-in-api

Then simply `git clone`, `npm install`, and `npm run build`

    git clone https://github.com/jhickmanit/auth0-onfido-rule
    cd auth0-onfido-rule
    npm install
    npm run build
The rule provided can be placed into your Auth0 tenant. Simply copy the contents (`rules-sample/onfido-idv-rule.js`) and paste into a new rule. (see: [https://auth0.com/docs/rules/create-rules](https://auth0.com/docs/rules/create-rules))

## Example App - The Details

The example app leverages `node`, `typescript`, and `express` along with the `onfido-node` sdk ([https://github.com/onfido/onfido-node](https://github.com/onfido/onfido-node)). It implements 4 routes:

    http[s]://somehost/rule-redirect [GET]
    http[s]://somehost/rule-redirect [POST]
    http[s]://somehost/rule-redirect/check [GET]
    http[s]://somehost/rule-redirect/status [GET] 
These routes handle different functions in the example, with the root rule-redirect path interacting with Auth0 and the /check and /status path used by the app to progress the user experience.

The example app also leverages `pug` for view tempting.

## Some Notes

This Example app is designed only as an example and should **NOT** be used in production.

Currently there is a 30 second window where the app will poll for results of the Onfido IdV check, however it is possible that in some scenarios the check can take longer (such as a fraudulent document or damaged document). In this case the example app will return to Auth0 after 30 seconds and provide app_metadata stating the claim is still in progress. See the `onfido-idv-rule.js` comments for details on how. to potentially handle this use case.

