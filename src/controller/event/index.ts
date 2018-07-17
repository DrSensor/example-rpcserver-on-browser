import Router = require('koa-router')
import TabWebhook from './tab-activity'

const route = new Router()
export const tab = new TabWebhook('/tab')

route.use('/$event', tab.Router.routes(), tab.Router.allowedMethods())

export default route
