import { OpenAIExt } from 'openai-ext'

function getGPTResponse(messages, onContent, onError) {
  const xhr = OpenAIExt.streamClientChatCompletion(
    {
      model: 'gpt-3.5-turbo',
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
