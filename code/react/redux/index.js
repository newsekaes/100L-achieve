exports.createStore = function createStore (reducer, preLoadedState) {
  let currentState = preLoadedState
  const listeners = []

  function dispatch (action) {
    currentState = reducer(currentState, action)
    listeners.map(fn => fn())
  }

  function subscribe (listener) {
    listeners.push(listener)
  }

  function getState () {
    return currentState
  }

  return {
    getState,
    subscribe,
    dispatch
  }
}
