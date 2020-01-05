const path = require('path')

const proxyHandlerPath = path
  .resolve(__dirname, 'proxy')
  .replace(path.resolve(), '')
const proxyFilePath = 'proxy.js'

/**
 * OfflineLambdaToLambdaPlugin class.
 */
class OfflineLambdaToLambdaPlugin {
  /**
   * Constructor.
   *
   * @param {Object} serverless Serverless
   * @param {Object} options Options
   */
  constructor (serverless, options) {
    this.serverless = serverless
    this.options = options

    this.hooks = {
      'before:offline:start': this.injectProxiedFunctions.bind(this),
      'before:offline:start:init': this.injectProxiedFunctions.bind(this)
    }
  }

  /**
   * Create new proxied functions of the instance's functions
   *
   * @returns {void}
   */
  injectProxiedFunctions () {
    let location = ''
    try {
      location = this.serverless.service.custom['serverless-offline'].location
      this.serverless.service.custom['serverless-offline'].location = ''
    } catch (_) {}

    this.serverless.cli.log(
      'Running Serverless Offline with lambda-to-lambda support'
    )

    const { functions } = this.serverless.service

    Object.entries(functions).forEach(([name, serverlessFunction]) => {
      const proxiedFunction = this.proxyFunction(serverlessFunction, location)
      functions[proxiedFunction.name] = proxiedFunction
    })
  }

  /**
   * Create a proxied function based on a instance function
   *
   * @returns {void}
   */
  proxyFunction (serverlessFunction, location) {
    const proxyEvents = []

    const awsSDKNodeEvent = this.createEvent(
      serverlessFunction,
      `/2015-03-31/functions/${serverlessFunction.name}/invocations`,
      {
        template: {
          'binary/octet-stream': JSON.stringify({
            location,
            body: '$input.body',
            targetHandler: serverlessFunction.handler
          })
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (awsSDKNodeEvent) proxyEvents.push(awsSDKNodeEvent)

    const awsSDKEvent = this.createEvent(
      serverlessFunction,
      `proxy/${serverlessFunction.name}`,
      {
        template: {
          'application/json': JSON.stringify({
            location,
            body: "$input.json('$')",
            targetHandler: serverlessFunction.handler
          })
        }
      },
      { headers: {} }
    )
    if (awsSDKEvent) proxyEvents.push(awsSDKEvent)

    const proxiedFunction = {
      name: `${serverlessFunction.name}_proxy`,
      handler: `${proxyHandlerPath}.handler`,
      environment: serverlessFunction.environment,
      events: proxyEvents,
      package: {
        include: [proxyFilePath]
      }
    }

    return proxiedFunction
  }

  /**
   * Check if path is available in function events
   *
   * @returns {void}
   */
  canUseHttpPath (serverlessFunction, path) {
    if (!path.startsWith('/')) {
      path = `${path}`
    }

    if (serverlessFunction.events) {
      const pathInUse = serverlessFunction.events.find(event => {
        if (event.http && event.http.path) {
          return event.http.path === path || event.http.path === path.substr(1)
        }
      })

      return !pathInUse
    }
    return true
  }

  /**
   * Create a serverless event with lambda integration
   *
   * @returns {void}
   */
  createEvent (serverlessFunction, path, request, response) {
    if (!this.canUseHttpPath(serverlessFunction, path)) {
      this.serverless.cli.log(
        `Warning: Function ${serverlessFunction.name} already has offline proxy defined!`
      )
      return
    }

    const lambdaIntegratedEvent = {
      http: {
        method: 'POST',
        path,
        integration: 'lambda',
        request,
        response
      }
    }
    return lambdaIntegratedEvent
  }
}

module.exports = OfflineLambdaToLambdaPlugin
