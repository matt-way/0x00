/** @jsxImportSource theme-ui */
import { useRef, useEffect } from 'react'
import { PopMenu, LoadingButton } from 'components/system'
import {
  startFirebaseAuth,
  cancelFirebaseAuth,
  sendVerificationEmail,
} from 'block-server/firebase'
import { useSettings } from 'state/settings/hooks'

const Auth = props => {
  const { close } = props
  const ref = useRef()
  const [settings] = useSettings()

  const { user } = settings

  useEffect(() => {
    if (!user || !user.email) {
      startFirebaseAuth(
        ref.current,
        authResult => {
          console.log('authResult', authResult)
          if (authResult?.user?.emailVerified) {
            sendVerificationEmail()
          }
        },
        error => {}
      )
    }
  }, [])

  useEffect(() => {
    if (user?.emailVerified) {
      close(true)
    }
  }, [user?.emailVerified])

  return (
    <PopMenu
      title="Authenticate"
      onClose={() => close(false)}
      top={-50}
      sx={{
        backgroundColor: '#242424',
        width: '350px',
        top: '50px',
        padding: '10px',
      }}>
      <div ref={ref} />
      {user && user.email && !user.emailVerified && (
        <div>
          <div
            sx={{
              fontSize: 12,
            }}>
            Email is not verified. Email must be verified before you can upload
            blocks.
          </div>
          <div
            sx={{
              textAlign: 'right',
              marginTop: '10px',
            }}>
            <LoadingButton
              onClick={async () => {
                await sendVerificationEmail()
              }}>
              Resend verification email
            </LoadingButton>
          </div>
        </div>
      )}
    </PopMenu>
  )
}

export default Auth
