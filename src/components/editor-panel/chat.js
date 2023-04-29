/** @jsxImportSource theme-ui */
import { useState } from 'react'
import { Flex, Input, Button, Icon } from 'components/system'
import { codePrompt } from './prompts'
import { getGPTResponse } from './gpt'

const Chat = props => {
  const { block, blockInstance, blockActions } = props
  const [request, setRequest] = useState('')
  const [streamText, setStreamText] = useState('')
  const [streamComplete, setStreamComplete] = useState(true)
  const blockConfig = block?.config?.block || {}

  return (
    <>
      <Flex
        sx={{
          padding: '5px',
          backgroundColor: 'surfaceHigh',
        }}>
        <Input
          sx={{
            width: '100%',
            textAlign: 'left',
            padding: '5px',
          }}
          placeholder="Ask GPT to write or update your code"
          onChange={e => setRequest(e.target.value)}
          value={request}
          focusOnMount={true}
        />
        <Button
          sx={{
            marginLeft: '5px',
          }}
          onClick={async () => {
            // build a list of input values and types
            const inputProps = Object.keys(blockInstance.inputValues || {}).map(
              key => ({
                name: key,
                type: blockConfig.properties[key].type || 'Object',
              })
            )
            const outputProps = Object.keys(
              blockInstance.outputLinks || {}
            ).map(key => ({
              name: key,
              type: blockConfig.properties[key].type || 'Object',
            }))
            const prompt = codePrompt(
              block.code,
              Object.keys(block.dependencies),
              inputProps,
              outputProps
            )
            console.log(prompt)

            try {
              setStreamText('')
              setStreamComplete(false)
              const xhr = getGPTResponse(
                [
                  {
                    role: 'system',
                    content: prompt,
                  },
                  {
                    role: 'user',
                    content: `Request: ${request}\nFull function body:\n`,
                  },
                ],
                (content, isFinal) => {
                  const lines = content.split('\n')
                  const last2Lines = lines.slice(-2)
                  setStreamText(last2Lines.join('\n'))
                  if (isFinal) {
                    setStreamComplete(true)
                    // check if the response is a valid code block
                    const regex = /```(?:javascript)?\n([\s\S]*)\n```/
                    const match = content.match(regex)
                    if (match && match[1]) {
                      blockActions.updateCode(match[1])
                      // set the stream text to anything that is outside code blocks
                      const outsideCode = content.replace(regex, '').trim()
                      setStreamText(outsideCode)
                    } else {
                      blockActions.updateCode(content)
                      setStreamText('')
                    }
                  }
                },
                error => {
                  setStreamComplete(true)
                  setStreamText('Error: ' + error)
                  console.log('error', error)
                }
              )
            } catch (err) {
              console.log('error', err)
            }
          }}>
          {streamComplete ? 'Send' : 'Stop'}
        </Button>
      </Flex>
      {streamText && streamText.length > 0 && (
        <Flex
          sx={{
            backgroundColor: 'surface',
            padding: '8px',
            borderRadius: '0 0 5px 5px',
            justifyContent: 'space-between',
          }}>
          <span>{streamText}</span>
          {streamComplete && (
            <Icon
              sx={{ cursor: 'pointer' }}
              type="close"
              onClick={() => setStreamText('')}
            />
          )}
        </Flex>
      )}
    </>
  )
}

export default Chat
