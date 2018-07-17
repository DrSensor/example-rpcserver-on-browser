import {EventEmitter} from 'events'
import {basename} from 'path'
import {IRouterContext} from 'koa-router'

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
  private onload = new Array(2) as boolean[]

  get allClosed() {return this.openedOnce ? this.IDs.length === 0 : false}
  get allInactive() {return this.activeIDs.length === 0}

  constructor(prefix?: string) {
    super()
    prefix = prefix || ''

    router.post(`${prefix}/open`, context => {
      this.openedOnce = true
      this.onload.fill(true)
      this.insert('open', this.IDs, context)
    })
    this.post(`${prefix}/show`).insertAt(this.activeIDs)

    this.post(`${prefix}/close`).deleteAt(this.IDs, 500)
    this.post(`${prefix}/hide`).deleteAt(this.activeIDs, 700)

    router.post(`${prefix}/reload`, context => {
      this.onload.fill(true)
      this.signal('reload', context)
    })
  }

  async noneIsActiveAfter(delay: number) {
    return new Promise(resolve => setTimeout(() => resolve(this.allInactive), delay))
  }

  async noneIsOpenAfter(delay: number) {
    return new Promise(resolve => setTimeout(() => resolve(this.allClosed), delay))
  }

  private post(path: string) {
    const event = basename(path)

    const delay = (time: number, context: IRouterContext, callback: () => void) => {
      context.status = 202
      setTimeout(() => {
        if (this.onload.every(load => load === false)) callback()
        this.onload.shift()
        this.onload.push(false)
      }, time)
    }

    return {
      insertAt: (store: any[], time = 400) => router.post(path,
        context => delay(time, context, () => this.insert(event, store, context))),
      deleteAt: (store: any[], time = 400) => router.post(path,
        context => delay(time, context, () => this.delete(event, store, context))),
    }
  }

  private insert(event: string, store: string[], context: IRouterContext) {
    store.push(context.request.body)
    this.signal(event, context)
  }

  private delete(event: string, store: string[], context: IRouterContext) {
    if (this.IDs.includes(context.request.body)) {
      const index = store.indexOf(context.request.body)
      store.splice(index, 1)
      this.signal(event, context)
    }
  }

  private signal(event: string, context: IRouterContext) {
    this.emit(event, context.request.body)
    context.status = 201
  }
}
