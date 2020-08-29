import describeTarget from '../src/utils/describeTarget'

const base = {
  target: {
    classList: {
      entries() {
        return []
      }
    }
  }
}



describe('describeTarget', () => {
  test('with event from normal button with id', () => {
    const buttonWithId = {
      ...base,
      target: {
        ...base.target,
        localName: 'button',
        innerText: 'Make purchase',
        attributes: {
          id: {
            value: 'abc'
          }
        },
      }
    }
    const result = describeTarget(buttonWithId)
    expect(result).toEqual({
      text: 'Make purchase',
      cssSelector: 'button#abc'
    })
  })

  test('with event from normal button with class name', () => {
    const buttonWithClassname = {
      ...base,
      target: {
        ...base.target,
        localName: 'button',
        attributes: {},
        classList: {
          entries() {
            return [
              [null, 'primary'],
              [null, 'mr4']
            ]
          }
        }
      }
    }
    const result = describeTarget(buttonWithClassname)
    expect(result).toEqual({
      cssSelector: 'button.primary.mr4'
    })
  })

  test('with event with data-track attribute', () => {
    const tracked = {
      ...base,
      target: {
        ...base.target,
        localName: 'a',
        innerText: 'Buy!',
        attributes: {
          id: {
            value: 'purchase'
          },
          'data-track': {
            value: 'Make purchase'
          }
        },
        classList: {
          entries() {
            return []
          }
        }
      }
    }
    const result = describeTarget(tracked)
    expect(result).toEqual({
      text: 'Buy!',
      eventName: 'Make purchase',
      cssSelector: 'a#purchase'
    })
  })
})