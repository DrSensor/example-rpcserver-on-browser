// tslint:disable:no-single-line-block-comment
// tslint:disable:no-console
import {EventEmitter} from 'events'
import {Client} from 'jsonrpc-bidirectional'
import readline = require('readline')

function autoComplete(keywords: string[], line: string) {
  const hits = keywords.filter(c => c.startsWith(line))
  // show all keywords if none found
  return [hits.length ? hits : keywords, line]
}

export default class extends EventEmitter {
  isPause?: boolean
  private promptOnce?: boolean

  private client?: Client
  private repl: readline.ReadLine

  private get functionList(): string[] { // https://stackoverflow.com/a/31055009
    if (this.client) return Object.getOwnPropertyNames(
      Object.getPrototypeOf(this.client)
    ).filter(f => f !== 'constructor')
    else return []
  }

  constructor() {
    super()
    this.repl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => autoComplete(this.functionList, line),
      prompt: '\x1b[93m⎝´•‿‿•`⎠╭☞\x1b[0m ',
    })
    console.clear()
    this.repl.on('close', () => this.emit('close'))
    this.repl.on('pause', () => this.isPause = true)
    this.repl.on('resume', () => this.isPause = false)
  }

  pause() {this.repl.pause()}
  resume() {this.repl.resume()}
  close() {this.repl.close()}

  promptAfter(delay: number) {setTimeout(() => this.repl.prompt(), delay * 1e3)}
  promptOnceAfter(delay: number) {
    if (!this.promptOnce) {
      this.promptAfter(delay)
      this.promptOnce = !this.promptOnce
    }
  }

  to(client: Client) {
    if (!this.client)
      this.repl.on('line', line => this.callRPC(line))
    this.client = client
    this.repl.prompt()
    // this.repl.on('line', this.listen) cause this.client undefined 🤔
  }

  async callRPC(line: string, clientRPC?: Client) {
    let result
    const client = clientRPC || this.client
    const [command, ...args] = line.trim().split(' ')

    // prompt when press ↙️enter
    if (!line.charCodeAt(0)) this.repl.prompt()
    else this.emit('beforeExec', line)

    if (this.functionList.includes(command))
      // @ts-ignore
      result = await client![command](...args)
    else
      result = await client!.rpc(command, args, /*notification*/true)

    this.emit('afterExec', line, result)

    if (result) {
      console.log(`\n${result}\n`)
      this.emit('afterPrint', result, line)
    }

    this.repl.prompt()
  }
}
