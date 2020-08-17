export default (expressApp) => {
  return {
    get: {
      handler: (request, response) => {
        response.send('i am ignored')
      },
    },
  }
}
