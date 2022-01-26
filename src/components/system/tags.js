/** @jsxImportSource theme-ui */
import { useState } from 'react'
import { Input } from 'components/system'
import { Icon } from '.'

const Tags = props => {
  const { readOnly, value = [], onChange } = props
  const [newTag, setNewTag] = useState('')

  return (
    <>
      <div
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '2px 2px 0px 2px',
        }}>
        {value.length <= 0 && (
          <span
            sx={{
              padding: '2px 0px',
            }}>
            [ ]
          </span>
        )}
        {value.map((tag, index) => (
          <span
            key={index}
            sx={{
              border: '1px solid',
              padding: readOnly ? '0px 5px 2px 5px' : '0px 3px 2px 5px',
              borderRadius: '3px',
              fontSize: '12px',
              marginRight: '5px',
              marginBottom: '5px',
            }}>
            {tag}
            {!readOnly && (
              <Icon
                sx={{
                  width: '12px',
                  height: '12px',
                  marginLeft: '5px',
                  cursor: 'pointer',
                }}
                type="close"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              />
            )}
          </span>
        ))}
      </div>
      {!readOnly && (
        <Input
          sx={{
            marginTop: '5px',
            textAlign: 'left'
          }}
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="Add tag and hit enter"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onChange([...value, newTag])
              setNewTag('')
            }
          }}
        />
      )}
    </>
  )
}

export default Tags
