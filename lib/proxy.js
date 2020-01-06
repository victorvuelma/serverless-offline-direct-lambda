const path = require('path')

async function handler (event, context) {
  const [targetHandlerFile, targetHandlerFunction] = event.targetHandler.split(
    '.'
  )
  const targetHandler = require(path.resolve('./', targetHandlerFile))

  return targetHandler[targetHandlerFunction](event.payload, context)
}

module.exports.handler = handler
