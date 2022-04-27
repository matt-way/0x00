/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { Button, Loader } from 'components/system'
import { useIsMounted } from 'utils/hooks'

const LoadingButton = props => {
  const { onClick, icon, children, ...rest } = props
  const [loading, setLoading] = useState(false)
  const isMounted = useIsMounted()

  return (
    <Button
      onClick={async (...args) => {
        setLoading(true)
        await onClick(...args)
        if (isMounted) {
          setLoading(false)
        }
      }}
      icon={loading ? undefined : icon}
      {...rest}>
      {loading ? <Loader /> : children}
    </Button>
  )
}

export default LoadingButton
