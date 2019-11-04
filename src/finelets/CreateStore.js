import __ from 'underscore'

function createGetters (items) {
  const obj = {}
  __.each(items, (item) => {
    obj[item] = (state) => state[item]
  })
  return obj
}

function createMutations (mutations) {
  const obj = {}
  __.each(mutations, (m) => {
    obj[m] = (state, data) => {
      state[m] = data
    }
  })
  return obj
}

function createStates (states) {
  const obj = {}
  __.each(states, (m) => {
    obj[m] = null
  })
  return obj
}

export default (items) => {
  return {
    states: createStates(items),
    getters: createGetters(items),
    mutations: createMutations(items)
  }
}
