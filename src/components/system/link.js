/** @jsxImportSource theme-ui */
//import { openExternalLink } from 'native/shell'

const Link = props => {
  const { url, children, ...rest } = props

  return (
    <span
      sx={{
        '&:hover': {
          color: 'text',
          cursor: 'pointer',
        },
      }}
      onClick={() => {
        //openExternalLink(url)
        console.log('TODO open external links')
      }}
      {...rest}>
      {children || url}
    </span>
  )
}

export default Link
