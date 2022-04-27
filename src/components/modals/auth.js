/** @jsxImportSource theme-ui */
import { useRef, useEffect } from 'react'
import { PopMenu, LoadingButton } from 'components/system'
import {
  startFirebaseAuth,
  checkVerificationStatus,
  sendVerificationEmail,
} from 'block-server/firebase'
import { useSettings } from 'state/settings/hooks'

const Auth = props => {
  const { close } = props
  const ref = useRef()
  const [settings] = useSettings()

  const { user } = settings

  // hack to override display name label
  function handleInsertion(e) {
    if (e.target.querySelector) {
      const label = e.target?.querySelector(
        'label[for="ui-sign-in-name-input"]'
      )
      if (label) {
        label.innerHTML = 'Display Name'
      }
    }
  }

  useEffect(() => {
    if (!user || !user.email) {
      startFirebaseAuth(ref.current)
      document.addEventListener('DOMNodeInserted', handleInsertion)
      return () => {
        document.removeEventListener('DOMNodeInserted', handleInsertion)
      }
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
            You have been sent a verification email. Once you are verified you
            can upload blocks. After clicking the verification link, please
            click the button below to check the status.
          </div>
          <div
            sx={{
              textAlign: 'right',
              marginTop: '20px',
            }}>
            <LoadingButton
              primary
              onClick={async () => {
                await checkVerificationStatus()
              }}>
              Check Verification Status
            </LoadingButton>
          </div>
          <div
            sx={{
              textAlign: 'right',
              marginTop: '10px',
            }}>
            <LoadingButton
              sx={{
                border: 'none',
                fontSize: '12px',
                textDecoration: 'underline',
                background: 'none',
                padding: 0,
              }}
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
