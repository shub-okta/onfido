class Configuration {
  public appSecret: string
  public issuerBaseURL: string
  public onfidoApiToken: string
  public onfidoRegion: string
  public onfidoReferrerPattern: string
  public onfidoReportNames: string
  public appURL: string
  public port: string

  constructor() {
    this.appSecret = String(process.env.APP_SECRET || 't#GS7Gq97@nu*?Cb')
    this.issuerBaseURL = this.stringTrailingSlash(
      String(process.env.ISSUER_BASE_URL || 'https://unknown'),
    )
    this.appURL = this.stringTrailingSlash(
      String(process.env.APP_URL || 'http:/localhost/'),
    )
    this.port = String(process.env.PORT || '3000')
    this.onfidoApiToken = String(process.env.ONFIDO_API_TOKEN || 'null')
    this.onfidoRegion = String(process.env.ONFIDO_REGION || 'EU')
    this.onfidoReferrerPattern = String(
      process.env.ONFIDO_REFERRER_PATTERN || this.appURL,
    )
    this.onfidoReportNames = String(
      process.env.ONFIDO_REPORT_NAMES || 'document,facial_similarity_photo',
    )
  }

  private stringTrailingSlash = (str: string) => {
    return str.endsWith('/') ? str.slice(0, -1) : str
  }
}

const configuration = new Configuration()

export default configuration
