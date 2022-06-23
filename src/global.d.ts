declare namespace Express {
  export interface Request extends Express.Request {
    isAuthenticated(): boolean
    session: Session
  }
}

interface Session extends Express.Request.Session {
  auth0State: string
  auth0Payload: string
  checkId: string
  applicant: string
}
