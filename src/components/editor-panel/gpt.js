import { OpenAIExt } from 'openai-ext'

function getGPTResponse(messages, onContent, onError) {
  const xhr = OpenAIExt.streamClientChatCompletion(
    {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.2,
      messages,
    },
    {
      apiKey: process.env.OPENAI_APIKEY,
      handler: {
        onContent,
        onError,
      },
    }
  )
  return xhr
}

export { getGPTResponse }
