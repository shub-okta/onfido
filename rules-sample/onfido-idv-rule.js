/* global configuration */

/**
 * Example Rule to redirect for Onfido Identity Verification and store the results in the user meta.
 * Use Rules configuration to define:
 *    - SESSION_TOKEN_SECRET: Long, random string, should match on Onfido app side.
 *    - ONFIDO_ID_VERIFICATION_URL: URL to receive the redirect
 *    - ONFIDO_API_TOKEN: Your Onfido API Token
 *    - ONFIDO_REGION: The supported Onfido region your tenant is operating in
 *
 * @param {object} user
 * @param {object} context
 * @param {function} callback
 */
async function redirectOnfidoRule(user, context, callback) {
  // using auth0 rule-utilities to make sure our rule is efficient in the pipeline
  const { Auth0RedirectRuleUtilities } = require('@auth0/rule-utilities@0.1.0');
  // requiring Onfido's node SDK for making the calls easier to Onfido's service. 
  const { Onfido, Region } = require('@onfido/api@1.5.1');

  const ruleUtils = new Auth0RedirectRuleUtilities(user, context, configuration);

  // creating a new Onfido client
  const onfidoClient = new Onfido({
    apiToken: configuration.ONFIDO_API_TOKEN,
    region:
      configuration.ONFIDO_REGION === 'EU' ? Region.EU : configuration.ONFIDO_REGION === 'US' ? Region.US : configuration.ONFIDO_REGION === 'CA' ? Region.CA : Region.EU,
  });

  user.app_metadata = user.app_metadata || {};

  if (ruleUtils.isRedirectCallback && ruleUtils.queryParams.sessionToken) {
    // User is back from the Onfido experience and has a session token to validate and assign to user meta

    // Validating session token and extracting payload for check results
    let payload;
    try {
      payload = ruleUtils.validateSessionToken();
    } catch (error) {
      return callback(error);
    }

    // assigning check status and result to the app_metadata so the downstream application can decided what to do next
    // note, in the example integration, the Onfido app returns after 30 seconds even if the check is still in progress 
    // If this claim status is still in_progress it is recommended the downstream application recheck for completion or implement the Onfido Webhook: https://documentation.onfido.com/#webhooks
    // Additionally, you can place these items into the idToken claim with custom claims as needed
    const idv = {
      check_result: payload.checkResult,
      check_status: payload.checkStatus,
      applicant: payload.applicant,
    };
    try {
      await auth0.users.updateAppMetadata(user.user_id, idv);
    } catch (error) {
      callback(error);
    }
    user.app_metadata.idv = idv;
    return callback(null, user, context);
  }

  if (ruleUtils.canRedirect && (user.app_metadata.idv === undefined || user.app_metadata.idv.check_status === '')) {
    // if the user has not already been redirected and check_status is empty, we will create the applicant and redirect to the Onfido implementation.
    let email;
    if (user.email && user.email_verified && validateEmail(user.email)) {
      // simple email validation. This can be replaced with assigning the email variable to a fake value (such as anon@example.com).
      email = user.email;
    }
    let applicant;
    try {
      applicant = await onfidoClient.applicant.create({
        // these values do not need to match what is on the document for IDV, but if Data Comparison on Onfido's side is tuned on, these values will flag
        // if Auth0 contains these values in the app_metadata or on the user object you can map them here as needed. You could also pass them in as query_string variables
        firstName: 'anon',
        lastName: 'anon',
        email,
      });
    } catch (error) {
      return callback(error);
    }
    try {
      // create the session token with the applicant id as a custom claim
      const sessionToken = ruleUtils.createSessionToken({ applicant: applicant.id });
      // redirect to Onfido implementation with sessionToken
      ruleUtils.doRedirect(configuration.ONFIDO_ID_VERIFICATION_URL, sessionToken);
      return callback(null, user, context);
    } catch (error) {
      return callback(error);
    }
  }
  return callback(null, user, context);

  // simple regex to validate it is a properly formatted email address.
  function validateEmail(email) {
    const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  }
}
