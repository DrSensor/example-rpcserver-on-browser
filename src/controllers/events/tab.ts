import {EventEmitter} from 'events'
import {basename} from 'path'
import Router = require('koa-router')
import bodyparser = require('koa-body')

const router = new Router()
router.use(bodyparser())

export default class extends EventEmitter {
  IDs: string[] = []
  activeIDs: string[] = []
  get inactiveIDs(): string[] {
    return this.IDs.filter(i => this.activeIDs.indexOf(i) < 0)
  }

  Router = router
  private openedOnce?: boolean

  get allClosed() {return this.openedOnce ? this.IDs.length === 0 : false}
  get noneIsActive() {return this.activeIDs.length === 0}

  get active(): number {return this.activeIDs.length}
  get inactive(): number {
    return this.IDs.length - this.activeIDs.length
  }

  constructor(prefix?: string) {
    super()
    prefix = prefix || ''

    router.post(`${prefix}/open`, context => {
      this.openedOnce = true
      this.insert('open', this.IDs, context)
    })

    router.post(`${prefix}/reload`, context => this.signal('reload', context))
    this.post(`${prefix}/show`).insertAt(this.activeIDs)
    this.post(`${prefix}/hide`).deleteAt(this.activeIDs)
    this.post(`${prefix}/close`).deleteAt(this.IDs)
  }

  private post(path: string) {
    const event = basename(path)
    return {
      insertAt: (store: any[]) => router.post(path, context => this.insert(event, store, context)),
      deleteAt: (store: any[]) => router.post(path, context => this.delete(event, store, context)),
    }
  }

  private insert(event: string, store: string[], context: Router.IRouterContext) {
    store.push(context.request.body)
    this.signal(event, context)
  }

  private delete(event: string, store: string[], context: Router.IRouterContext) {
    const index = store.indexOf(context.request.body)
    store.splice(index, 1)
    this.signal(event, context)
  }

  private signal(event: string, context: Router.IRouterContext) {
    this.emit(event, context.request.body)
    context.status = 201
  }
}
