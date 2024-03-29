// Error handling
const fncWithError = () => {
    throw new Error('error error error')
}

//fncWithError()
// in such way we can create our own errors

// console.log('continue (try)')
//after error throwing, we can't continue execute anything, so console.log statement won't work
// such error is an uncaught error and we can see it if we will run code in browser console

try {
    throw new Error('new error')
} catch (error) {
    console.log('it is just an error')
    console.error(error)
    console.log(error.message)
}
console.log('and now everything is ok')
// with try/catch block we can execute our code normally even with errors
// console.error statemtn will add error message after code execution is finished
