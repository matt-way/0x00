/** @jsxImportSource theme-ui */
import { useState, useRef } from 'react'
import { useBlock } from 'state/blocks/hooks'
import { Form, FormHeader, FormItem, FormActions } from 'components/form'
import { Flex, Input, Textarea, LoadingButton, Tags } from 'components/system'
import { useModalActions } from 'state/modals/hooks'
import { useToastActions } from 'state/toasts/hooks'
import { useSettings } from 'state/settings/hooks'
import { modalIds } from 'state/modals/model'
import { uploadBlock } from 'block-server/upload-block'

const GeneralInformation = props => {
  const { blockId } = props
  const [block, blockActions] = useBlock(blockId)
  const [settings] = useSettings()
  const toastActions = useToastActions()
  const modalActions = useModalActions()
  const ref = useRef()

  return (
    <Flex
      ref={ref}
      sx={{
        padding: [5],
        borderBottom: '2px solid',
        borderBottomColor: 'background',
        color: 'textSecondary',
      }}>
      <Flex
        sx={{
          flex: 1,
          flexDirection: 'column',
        }}>
        <FormHeader
          sx={{
            flex: 1,
          }}
          icon="squareEditOutline"
          onIconClick={() => {
            const offset = ref.current.getBoundingClientRect()
            modalActions.openAt(
              modalIds.editBlockInformation,
              { x: offset.right, y: offset.top },
              { blockId }
            )
          }}>
          Block Details
        </FormHeader>
        <Form>
          <FormItem
            label="Name"
            control={<Input readOnly={true} value={block.name} />}
          />
          <FormItem
            label="Version"
            control={
              <Input readOnly={true} value={block.config.version || ''} />
            }
          />
          <FormItem
            label="Tags"
            control={<Tags readOnly={true} value={block.config.tags} />}
          />
          <FormItem
            label="Description"
            control={
              <Textarea
                readOnly={true}
                value={block.config.description || ''}
              />
            }
          />
          <FormActions sx={{ textAlign: 'right' }}>
            <LoadingButton
              icon="cloudUploadOutline"
              onClick={async e => {
                const { version, description, tags } = block.config
                if (!version || !description || !tags.length) {
                  toastActions.addError(
                    'uploadBlockValidationError',
                    'Validation error',
                    'All information fields are required.'
                  )
                } else {
                  const offset = e.currentTarget.getBoundingClientRect()
                  const confirmed = await modalActions.openAt(
                    modalIds.confirmation,
                    { x: offset.left, y: offset.top }
                  )
                  if (confirmed) {
                    const { user } = settings

                    let authorised = true
                    if (!user || !user.email || !user.emailVerified) {
                      authorised = await modalActions.openAt(modalIds.auth)
                    }

                    if (authorised) {
                      try {
                        const result = await uploadBlock(block)
                        toastActions.addSuccess(
                          'uploadBlockSuccess',
                          'Block uploaded',
                          `${block.name} (${block.config.version}) successfully uploaded.`
                        )
                      } catch (error) {
                        toastActions.addError(
                          'uploadBlockError',
                          'Block upload failed',
                          `${block.name} (${block.config.version}) upload error: ${error}.`
                        )
                      }
                    }
                  }
                }
              }}>
              <span title="This is hover text">Upload</span>
            </LoadingButton>
          </FormActions>
        </Form>
      </Flex>
    </Flex>
  )
}

export default GeneralInformation
