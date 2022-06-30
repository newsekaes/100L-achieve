const runPromiseByLimit = async (promiseCreatorArray, limit) => {
  const taskLength = promiseCreatorArray.length

  if (taskLength <= limit) {
    const promises = promiseCreatorArray.map(promiseCreator => promiseCreator())
    return Promise.all(promises)
  }

  let pushedIndex = 0
  const promiseRunningStack = []
  const taskResult = []

  /* 填补可运行的stack直到达到limit */
  function generatePromiseRunningStack (delTaskIndex) {
    if (typeof delTaskIndex !== 'undefined') {
      const findIndex = promiseRunningStack.findIndex(promise => promise._taskIndex === delTaskIndex)
      promiseRunningStack.splice(findIndex, 1)
    }
    while (promiseRunningStack.length < limit && pushedIndex < taskLength) {
      const index = pushedIndex++
      const promise =
        promiseCreatorArray[index]()
          .then(result => ({ result, index }))
      promise._taskIndex = index
      promiseRunningStack.push(promise)
    }
  }

  generatePromiseRunningStack()

  function runLimitedTask () {
    return Promise.race(promiseRunningStack)
      .then(({ result, index }) => {
        generatePromiseRunningStack(index)
        taskResult[index] = result
        if (promiseRunningStack.length) {
          return runLimitedTask()
        } else {
          return 'done'
        }
      })
  }

  await runLimitedTask()
  return taskResult
}

const runPromiseByLimit2 = async function (promiseCreatorArray, limit) {
  const taskLength = promiseCreatorArray.length

  if (taskLength <= limit) {
    const promises = promiseCreatorArray.map(promiseCreator => promiseCreator())
    return Promise.all(promises)
  }

  const promiseRunningStack = []
  const taskPromises = []

  promiseRunningStack.delByTaskIndex = function (delTaskIndex) {
    const delIndex = this.findIndex(promise => promise._taskIndex === delTaskIndex)
    this.splice(delIndex, 1)
  }

  promiseRunningStack.addByTaskIndex = function (promiseFactory, taskIndex) {
    const promise = promiseFactory()
    taskPromises.push(promise)
    const promiseWithIndex = promiseFactory().then(result => ({ result, taskIndex }))
    promiseWithIndex._taskIndex = taskIndex
    this.push(promiseWithIndex)
  }

  await promiseCreatorArray.reduce((prePromise, promiseFactory, taskIndex) => {
    if (taskIndex < limit - 1) {
      promiseRunningStack.addByTaskIndex(promiseFactory, taskIndex)
      return Promise.resolve({})
    } else {
      return prePromise.then(({ delTaskIndex }) => {
        if (typeof delTaskIndex !== 'undefined') {
          promiseRunningStack.delByTaskIndex(delTaskIndex)
        }
        promiseRunningStack.addByTaskIndex(promiseFactory, taskIndex)
        return Promise.race(promiseRunningStack)
      })
    }
  }, Promise.resolve({}))

  /* 事实上，此时完成的是最后一次race, 而显然race中还有未完成的 */
  /* 所幸我们已经在途中顺便将所有的 promise 实例加入到了taskPromises中，下一步直接用Promise.all即可 */

  return Promise.all(taskPromises)
}

module.exports = { runPromiseByLimit, runPromiseByLimit2 }
