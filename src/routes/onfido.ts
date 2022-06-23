import express from 'express'
import url from 'url'
import { Onfido, Region } from '@onfido/api'
import jwt from 'jsonwebtoken'
import configuration from '../util/config'

const onfidoClient = new Onfido({
  apiToken: configuration.onfidoApiToken,
  region:
    configuration.onfidoRegion === 'EU'
      ? Region.EU
      : configuration.onfidoRegion === 'US'
      ? Region.US
      : configuration.onfidoRegion === 'CA'
      ? Region.CA
      : Region.EU,
})
const router = express.Router()

router.get('/', (req, res) => {
  const query = url.parse(req.url, true).query
  const sessionToken = String(query.session_token)
  const auth0State = String(query.state)
  req.session.auth0State = auth0State
  const validIssuer = `${configuration.issuerBaseURL}/`
  const payload = jwt.verify(sessionToken, configuration.appSecret, {
    issuer: validIssuer,
  })

  //eslint-disable-next-line
  //@ts-ignore
  if (!payload.exp) {
    res.status(403).render('error', {
      message: 'Session Token is expired.',
    })
  }
  req.session.auth0Payload = payload
  //eslint-disable-next-line
  //@ts-ignore
  const { applicant } = payload
  req.session.applicant = applicant
  return onfidoClient.sdkToken
    .generate({
      applicantId: applicant,
      referrer: configuration.onfidoReferrerPattern,
    })
    .then((sdkToken) => {
      res.status(200).render('onfido', {
        sdkToken,
      })
    })
    .catch((error) => {
      res.status(500).render('error', {
        message: error,
      })
    })
})

router.post('/', (req, res) => {
  const { auth0State, auth0Payload, checkId } = req.session
  const complete = req.body.onfidoComplete
  if (complete) {
    return onfidoClient.check
      .find(checkId)
      .then((response) => {
        const sessionToken = {
          checkStatus: response.status,
          checkResult: response.result,
          applicant: response.applicantId,
          ...auth0Payload,
        }
        const signed = jwt.sign(sessionToken, configuration.appSecret)
        const continueUrl = `${configuration.issuerBaseURL}/continue?state=${auth0State}&session_token=${signed}`
        res.redirect(continueUrl)
      })
      .catch((error) => {
        res.status(500).render('error', { message: error })
      })
  } else {
    return onfidoClient.check
      .find(checkId)
      .then((response) => {
        const sessionToken = {
          checkStatus: response.status,
          checkResult: response.result,
          ...auth0Payload,
        }
        const signed = jwt.sign(sessionToken, configuration.appSecret)
        const continueUrl = `${configuration.issuerBaseURL}/continue?state=${auth0State}&session_token=${signed}`
        res.redirect(continueUrl)
      })
      .catch((error) => {
        res.status(500).render('error', { message: error })
      })
  }
})

router.get('/check', (req, res) => {
  const { applicant } = req.session
  const reportNames = configuration.onfidoReportNames.split(',')
  return onfidoClient.check
    .create({ applicantId: applicant, reportNames })
    .then((response) => {
      req.session.checkId = response.id
      res.status(200).json({ status: response.status })
    })
    .catch((error) => {
      res.status(500).json({ message: error })
    })
})

router.get('/status', (req, res) => {
  const { checkId } = req.session
  return onfidoClient.check
    .find(checkId)
    .then((response) => {
      res.status(200).json({ status: response.status })
    })
    .catch((error) => {
      res.status(500).json({ message: error })
    })
})

export default router
