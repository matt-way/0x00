function getClaudeResponse(systemPrompt, messages, onContent, onError) {
  const controller = new AbortController()

  ;(async () => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
          max_tokens: 8096,
          stream: true,
          system: systemPrompt,
          messages,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        onError(errorText)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete last line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (!data) continue
            try {
              const event = JSON.parse(data)
              if (
                event.type === 'content_block_delta' &&
                event.delta?.type === 'text_delta'
              ) {
                fullContent += event.delta.text
                onContent(fullContent, false)
              } else if (event.type === 'message_stop') {
                onContent(fullContent, true)
              }
            } catch (e) {
              // ignore JSON parse errors on partial SSE lines
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err.message)
      }
    }
  })()

  return controller
}

export { getClaudeResponse }
