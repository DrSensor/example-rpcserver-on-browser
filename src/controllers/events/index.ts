import Router = require('koa-router')
import TabWebhook from './tab'

const route = new Router()
export const tab = new TabWebhook()

route.use('/$event', tab.Router.routes(), tab.Router.allowedMethods())

export default route
