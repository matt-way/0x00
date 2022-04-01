const darkTheme = {
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'Georgia, serif',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64],
  space: [0, 1, 2, 3, 5, 6, 8, 13, 21, 34, 55],
  colors: {
    text: '#fff',
    textSecondary: '#bebebe',
    background: '#1d1d1d',
    surfaceHighest: '#424242',
    surfaceHigh: '#393939',
    surface: '#2c2c2c',
    surfaceLow: '#282828',
    surfaceLowest: '#252525',
    primary: '#1a8ea5',
    blockBackground: '#252525',
    blockHeader: 'cornflowerblue',
    hubBackground: 'lightgrey',
    popMenuBackground: '#252525',
    inputBackground: '#1f1f1f',
    buttonPrimary: '#374973',
  },
  styles: {
    root: {
      fontFamily: 'body',
      fontSize: [0],
      '#root': {
        height: '100vh',
      },
      textarea: {
        fontFamily: 'body',
      },
    },
  },
}

export default darkTheme
