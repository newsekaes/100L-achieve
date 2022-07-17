const { createStore } = require('code/react/redux')

describe('Test redux', () => {
  it('Test initial state', function () {
    const store = createStore(() => {}, 'foo')
    expect(store.getState()).toBe('foo')
  })
  it('Test Dispatch change state', function () {
    const state1 = 'foo'
    const state2 = 'bar'

    const fn1 = jest.fn()
    const fn2 = jest.fn()

    const store = createStore((oldState, action) => {
      expect(oldState).toBe(state1)
      if (action.type === 1) {
        fn1()
      } else {
        fn2()
      }
      return state2
    }, state1)

    store.dispatch({ type: 1 })
    expect(store.getState()).toBe(state2)
    expect(fn1).toBeCalled()
    expect(fn2).toBeCalledTimes(0)
  })
  it('Test listener called', function () {
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    const store = createStore(() => {}, 0)

    store.subscribe(listener1)
    store.dispatch()
    expect(listener1).toBeCalledTimes(1)
    expect(listener2).toBeCalledTimes(0)

    store.subscribe(listener2)
    store.dispatch()
    expect(listener1).toBeCalledTimes(2)
    expect(listener2).toBeCalledTimes(1)
  })
})
