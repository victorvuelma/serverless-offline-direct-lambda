const path = require('path')

function handler (event, context, callback) {
  const [targetHandlerFile, targetHandlerFunction] = event.targetHandler.split(
    '.'
  )
  const targetHandler = require(path.resolve('./', targetHandlerFile))

  targetHandler[targetHandlerFunction](
    event.body,
    context,
    (error, response) => {
      if (error) {
        callback(null, {
          StatusCode: 500,
          FunctionError: 'Handled',
          Payload: error
        })
      } else {
        callback(null, response)
      }
    }
  )
}

module.exports.handler = handler
