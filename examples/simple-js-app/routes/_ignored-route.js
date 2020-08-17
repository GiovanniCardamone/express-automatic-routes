export default (expressApp) => {
  return {
    get: {
      handler: (request, response) => {
        response.send(`hello user ${request.params.userId} comments`)
      },
    },
  }
}
