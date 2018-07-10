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
  private client?: Client
  private repl: readline.ReadLine

  private promptOnce?: boolean

  // https://stackoverflow.com/a/31055009
  private get functionList() {
    return Object.getOwnPropertyNames(
      Object.getPrototypeOf(this.client)
    ).filter(f => f !== 'constructor')
  }

  constructor() {
    super()
    this.repl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => autoComplete(this.functionList, line),
      prompt: '( ͡° ͜ʖ ͡°) ',
    })
    console.clear()
    this.repl.on('close', () => this.emit('close'))
  }

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
