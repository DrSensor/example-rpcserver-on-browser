import {EventEmitter} from 'events'
import {IncomingMessage} from 'http'
import {Socket} from 'net'

import JSONRPC = require('jsonrpc-bidirectional')
import WebSocket = require('ws')

export {default as LED} from './led'

export default class<T extends JSONRPC.Client> extends EventEmitter {
  get Client() {return this.client}

  private jsonrpcServer = new JSONRPC.Server()
  private websocketServer = new WebSocket.Server({noServer: true})

  private client!: T
  private ClientClass: T
  private server?: EventEmitter

  constructor(ClientClass: T) {
    super()
    this.ClientClass = ClientClass
    this.jsonrpcServer.registerEndpoint(new JSONRPC.EndpointBase('LED', '/rpc', {}, ClientClass))

    // By default, JSONRPC.Server rejects all requests as not authenticated and not authorized.
    this.jsonrpcServer.addPlugin(new JSONRPC.Plugins.Server.AuthenticationSkip())
    this.jsonrpcServer.addPlugin(new JSONRPC.Plugins.Server.AuthorizeAll())
  }

  upgrade(server: EventEmitter) {
    if (this.server) this.server.removeAllListeners() // ⬅️ flush out previous server
    server.on('upgrade',
      (response, socket, head) => this.websocketUpgrade(response, socket, head)
    )
    this.server = server
    return this
  }

  close() {
    this.websocketServer.removeAllListeners()
    this.websocketServer.close()
  }

  private websocketUpgrade(upgradeRequest: IncomingMessage, socket: Socket, upgradeHeader: Buffer) {
    const wsJSONRPCRouter = new JSONRPC.BidirectionalWebsocketRouter(this.jsonrpcServer)

    this.websocketServer.handleUpgrade(upgradeRequest, socket, upgradeHeader, webSocket => {
      const nWebSocketConnectionID = wsJSONRPCRouter.addWebSocketSync(webSocket, upgradeRequest)
      this.client = wsJSONRPCRouter.connectionIDToSingletonClient(
        nWebSocketConnectionID,
        this.ClientClass
      )
      this.emit('connected')
    })
  }
}
