export default (expressApp) => {
  return {
    get: {
      handler: (request, response) => {
        response.send(`hello users`)
      },
    },
  }
}
