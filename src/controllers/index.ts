import {EventEmitter} from 'events'
import JSONRPC = require('jsonrpc-bidirectional')
import WebSocket = require('ws')

// import {tab} from './events'
export {default as LED} from './led'

export default class<T extends JSONRPC.Client> extends EventEmitter {
  private _client!: T
  get Client() {return this._client}

  private jsonrpcServer: JSONRPC.Server
  private webSocketServer: WebSocket.Server
  // private wsJSONRPCRouter: JSONRPC.BidirectionalWebsocketRouter
  private ClientClass: T
  private server?: EventEmitter

  constructor(ClientClass: T) {
    super()
    this.ClientClass = ClientClass
    const jsonrpcServer = new JSONRPC.Server()
    jsonrpcServer.registerEndpoint(new JSONRPC.EndpointBase('LED', '/rpc', {}, ClientClass))

    // By default, JSONRPC.Server rejects all requests as not authenticated and not authorized.
    jsonrpcServer.addPlugin(new JSONRPC.Plugins.Server.AuthenticationSkip())
    jsonrpcServer.addPlugin(new JSONRPC.Plugins.Server.AuthorizeAll())

    this.webSocketServer = new WebSocket.Server({noServer: true})
    /* Register when connected doesn't work unless I can get http.Server instance from Koa instance.
    For example ➡️ const webSocketServer = new WebSocket.Server({server: Koa.httpServer})

    webSocketServer.on('connection', async (webSocket, upgradeRequest) => {
      const nWebSocketConnectionID = wsJSONRPCRouter.addWebSocketSync(webSocket, upgradeRequest)
      this._client = wsJSONRPCRouter.connectionIDToSingletonClient(
        nWebSocketConnectionID,
        ClientClass
      )
    })
    */

    this.jsonrpcServer = jsonrpcServer
  }

  upgrade(server: EventEmitter) {
    const wsJSONRPCRouter = new JSONRPC.BidirectionalWebsocketRouter(this.jsonrpcServer)
    if (this.server) this.server.removeAllListeners() // ⬅️ flush out previous server

    server.on('upgrade', (upgradeRequest, socket, upgradeHeader) =>
      this.webSocketServer.handleUpgrade(upgradeRequest, socket, upgradeHeader, webSocket => {
        const nWebSocketConnectionID = wsJSONRPCRouter.addWebSocketSync(webSocket, upgradeRequest)
        this._client = wsJSONRPCRouter.connectionIDToSingletonClient(
          nWebSocketConnectionID,
          this.ClientClass
        )
        this.emit('connected')
      })
    )

    this.server = server
    return this
  }
}
