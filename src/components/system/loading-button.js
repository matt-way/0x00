/** @jsxImportSource theme-ui */
import { useState } from 'state-management/hooks'
import { Button, Loader } from 'components/system'

const LoadingButton = props => {
  const { onClick, icon, children, ...rest } = props
  const [loading, setLoading] = useState(false)

  return (
    <Button
      onClick={async (...args) => {
        setLoading(true)
        await onClick(...args)
        setLoading(false)
      }}
      icon={loading ? undefined : icon}
      {...rest}>
      {loading ? <Loader /> : children}
    </Button>
  )
}

export default LoadingButton
