/** @jsxImportSource theme-ui */
import { useRef, useCallback, useEffect } from 'react'
import { useWorkspace } from 'state/workspace/hooks'
import { useBlock } from 'state/blocks/hooks'
import { useProgram } from 'state/program/hooks'
import { useSettings } from 'state/settings/hooks'
import Editor from '@monaco-editor/react'
import EditorToolbar from './toolbar'
import Chat from './chat'

const MonacoPanel = props => {
  const { blockId } = props
  const editorRef = useRef()
  const [block, blockActions] = useBlock(blockId)
  const [settings] = useSettings()
  const [program] = useProgram()
  const blockInstance = program?.config?.blocks[blockId] || {}
  const showChat = block?.config?.block?.showChat

  const onCodeChanged = useCallback(newCode => {
    blockActions.updateCode(newCode)
  }, [])

  const onEditorDidMount = useCallback(editor => {
    editorRef.current = editor
    editor.focus()
  }, [])

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout()
    }
  }, [showChat])

  return (
    <div
      sx={{
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}>
      {/* Editor column */}
      <div
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
        }}>
        <EditorToolbar block={block} blockActions={blockActions} />
        <div sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Editor
            language="javascript"
            theme="vs-dark"
            value={block.hotcode}
            options={settings.editor}
            onChange={onCodeChanged}
            onMount={onEditorDidMount}
            automaticLayout={false}
          />
        </div>
      </div>
      {/* Chat side panel */}
      {showChat && (
        <Chat
          block={block}
          blockActions={blockActions}
          blockInstance={blockInstance}
        />
      )}
    </div>
  )
}

const EditorPanel = props => {
  const [workspace] = useWorkspace()
  return workspace.selectedBlockId ? (
    <MonacoPanel
      key={workspace.selectedBlockId}
      blockId={workspace.selectedBlockId}
    />
  ) : null
}

export default EditorPanel
