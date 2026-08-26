/** @jsxImportSource theme-ui */
import { useState, useRef, useEffect } from 'react'
import { Flex, Button, Icon, Textarea } from 'components/system'
import { codePrompt } from './prompts'
import { getClaudeResponse } from './claude'

const MessageBubble = ({ role, content }) => (
  <div
    sx={{
      padding: '8px 10px',
      marginBottom: '8px',
      borderRadius: '5px',
      backgroundColor: role === 'user' ? 'surfaceHigh' : 'surface',
      fontSize: '12px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
    <div
      sx={{
        fontSize: '10px',
        fontWeight: 'bold',
        marginBottom: '4px',
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
      {role === 'user' ? 'You' : 'Claude'}
    </div>
    {content}
  </div>
)

const Chat = props => {
  const { block, blockInstance, blockActions } = props
  const [messages, setMessages] = useState([])
  const [request, setRequest] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const controllerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const blockConfig = block?.config?.block || {}

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendRequest = () => {
    if (!request.trim() || isStreaming) return

    const userMessage = request.trim()
    setRequest('')

    const inputProps = Object.keys(blockInstance.inputValues || {}).map(
      key => ({
        name: key,
        type: blockConfig.properties?.[key]?.type || 'Object',
      })
    )
    const outputProps = Object.keys(blockInstance.outputLinks || {}).map(
      key => ({
        name: key,
        type: blockConfig.properties?.[key]?.type || 'Object',
      })
    )

    const systemPrompt = codePrompt(block.code, inputProps, outputProps)

    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages([...newMessages, { role: 'assistant', content: '' }])
    setIsStreaming(true)

    const controller = getClaudeResponse(
      systemPrompt,
      newMessages.map(m => ({ role: m.role, content: m.content })),
      (content, isFinal) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content }
          return updated
        })
        if (isFinal) {
          setIsStreaming(false)
          const regex = /```(?:javascript)?\n([\s\S]*?)\n```/
          const match = content.match(regex)
          if (match?.[1]) {
            blockActions.updateCode(match[1])
          }
        }
      },
      error => {
        setIsStreaming(false)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Error: ${error}`,
          }
          return updated
        })
      }
    )
    controllerRef.current = controller
  }

  const stopStreaming = () => {
    controllerRef.current?.abort()
    setIsStreaming(false)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendRequest()
    }
  }

  return (
    <Flex
      direction="column"
      sx={{
        width: '300px',
        flexShrink: 0,
        borderLeft: '2px solid',
        borderLeftColor: 'surfaceLowest',
        backgroundColor: 'background',
      }}>
      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: '5px 8px 5px 12px',
          backgroundColor: 'surface',
          borderBottom: '2px solid',
          borderBottomColor: 'surfaceLowest',
          flexShrink: 0,
        }}>
        <span sx={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.8 }}>
          Claude
        </span>
        <Flex alignItems="center" sx={{ gap: '4px' }}>
          {messages.length > 0 && !isStreaming && (
            <Icon
              sx={{
                cursor: 'pointer',
                opacity: 0.4,
                '&:hover': { opacity: 0.8 },
              }}
              type="trashcanOutline"
              size={15}
              title="Clear conversation"
              onClick={() => setMessages([])}
            />
          )}
          <Icon
            sx={{
              cursor: 'pointer',
              opacity: 0.4,
              '&:hover': { opacity: 0.8 },
            }}
            type="close"
            size={16}
            onClick={() => blockActions.showChat(false)}
          />
        </Flex>
      </Flex>

      {/* Messages */}
      <div
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '10px',
        }}>
        {messages.length === 0 && (
          <div
            sx={{
              color: 'text',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '30px',
              opacity: 0.3,
              lineHeight: '1.6',
            }}>
            Ask Claude to write or update your code.
            <br />
            Changes are applied automatically.
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Flex
        direction="column"
        sx={{
          padding: '8px',
          borderTop: '2px solid',
          borderTopColor: 'surfaceLowest',
          flexShrink: 0,
          gap: '6px',
        }}>
        <Textarea
          placeholder={'Ask Claude... (Enter to send, Shift+Enter for newline)'}
          value={request}
          onChange={e => setRequest(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          sx={{ fontSize: '12px', resize: 'none' }}
          autoFocus
        />
        <Button
          sx={{ width: '100%', fontSize: '12px' }}
          onClick={isStreaming ? stopStreaming : sendRequest}>
          {isStreaming ? 'Stop' : 'Send'}
        </Button>
      </Flex>
    </Flex>
  )
}

export default Chat
