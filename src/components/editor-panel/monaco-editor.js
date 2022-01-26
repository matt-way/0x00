/** @jsxImportSource theme-ui */
import { useRef, useCallback, useEffect } from 'react'
import { useWorkspace } from 'state/workspace/hooks'
import { useBlock } from 'state/blocks/hooks'
import { useSettings } from 'state/settings/hooks'
import Editor from '@monaco-editor/react'

const MonacoPanel = props => {
  const { blockId } = props
  const [block, blockActions] = useBlock(blockId)
  const [settings] = useSettings()

  const onCodeChanged = useCallback(newCode => {
    blockActions.updateCode(newCode)
  }, [])

  const onEditorDidMount = useCallback(editor => {
    editor.focus()
  }, [])

  return (
    <div
      sx={{
        position: 'relative',
        height: '100%',
      }}>
      <div
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 1,
        }}>
        <Editor
          //ref={editorRef}
          language="javascript"
          theme="vs-dark"
          value={block.hotcode}
          options={settings.editor}
          onChange={onCodeChanged}
          editorDidMount={onEditorDidMount}
        />
      </div>
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
