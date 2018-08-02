import JSONRPC = require('jsonrpc-bidirectional')

export default class extends JSONRPC.Client {
  input(voltage: string, current: string) {
    return this.rpc('input', [voltage, current])
  }

  '.status'() {
    return this.rpc('.status', [])
  }
}
