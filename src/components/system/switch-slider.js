/** @jsxImportSource theme-ui */
import Flex from './flex'
import FlexBox from './flex-box'

const SwitchSlider = props => {
  const { options, selectedIndex, onClick } = props

  return (
    <Flex
      sx={{
        backgroundColor: 'red',
        padding: [1],
      }}>
      {options.map((option, index) => {
        return (
          <FlexBox
            key={index}
            sx={{
              textAlign: 'center',
              backgroundColor: index === selectedIndex ? 'blue' : 'transparent',
            }}
            onClick={() => {
              onClick(index)
            }}>
            {option}
          </FlexBox>
        )
      })}
    </Flex>
  )
}

export default SwitchSlider
