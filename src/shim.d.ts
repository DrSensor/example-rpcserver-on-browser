declare module 'html-webpack-externals-plugin' {
  import { Plugin } from 'webpack'

  export = HtmlWebpackExternalsPlugin

  class HtmlWebpackExternalsPlugin extends Plugin {
    constructor(options?: HtmlWebpackExternalsPlugin.Options)
  }

  namespace HtmlWebpackExternalsPlugin {
    interface Supplement {
      path: string
      cwpPatternConfig?: object
    }

    interface Entry extends Supplement {
      type: 'js' | 'css'
      attributes?: { [key: string]: string }
    }

    interface External {
      module?: string
      entry?: string | string[] | Entry | Array<Entry | string>
      global?: string | null
      supplements?: string[] | Supplement[]
      append?: boolean
    }

    interface Options {
      externals: External[]
      hash?: boolean
      outputPath?: string
      publicPath?: string | null
      files?: string | string[] | null
      cwpOptions?: object
      enabled?: boolean
    }
  }
}

declare module 'jsonrpc-bidirectional' {
  import events = require('events')
  import ws = require('ws')
  import http = require('http')

  export = JSONRPC

  interface Request {
    readonly isNotification: boolean

    // #region WAITING: https://github.com/Microsoft/TypeScript/issues/21759
    requestBody: string | object | null
    requestObject: object | object[] | null
    isMethodCalled: boolean
    callResult: number | string | object | any[] | Error | null
    // #endregion

    toResponseObject(): object
  }

  interface EndpointBase {
    readonly path: string
    readonly name: string
    readonly reflection: object
    readonly ReverseCallsClientClass: JSONRPC.Client | null

    new (
      name: string,
      path: string,
      reflection: object,
      classReverseCallsClient: JSONRPC.Client | null
    ): this
    /*static*/ normalizePath(url: string): string
  }

  namespace JSONRPC {
    const EndpointBase: EndpointBase

    interface OutgoingRequest extends Request {
      readonly callID?: number | string
      readonly headers: object

      // #region WAITING https://github.com/Microsoft/TypeScript/issues/21759
      params: any[] | null
      methodName: string | null
      endpointURL: string | null
      responseBody: string | object | null
      responseObject: object | object[] | null
      // #endregion

      new (method: string, params: any[], mxxCallID?: number | string): this
      toRequestObject(): {
        method: string | null
        params: any[] | null
        id?: number | string
        jsonrpc: '2.0'
      }
    }

    interface ClientPluginBase {
      new (): this
      beforeJSONEncode(outgoingRequest: OutgoingRequest): Promise<any>
      afterJSONEncode(outgoingRequest: OutgoingRequest): Promise<any>
      makeRequest(outgoingRequest: OutgoingRequest): Promise<null>
      beforeJSONDecode(outgoingRequest: OutgoingRequest): Promise<any>
      afterJSONDecode(outgoingRequest: OutgoingRequest): Promise<any>
      exceptionCatch(outgoingRequest: OutgoingRequest): Promise<any>
    }

    class Client extends events.EventEmitter {
      static readonly JSONRPC_VERSION: string
      readonly endpointURL: string | null
      readonly plugins: ClientPluginBase[]
      readonly callID: number
      readonly httpUser: string | null
      readonly httpPassword: string | null

      constructor(endpointURL: string, fetchOptions?: object)
      setHTTPCredentials(username: string, password: string): void
      rpc(
        functionName: string,
        params: any[],
        notification?: boolean
      ): Promise<number | string | object | any[]>
      addPlugin(plugin: ClientPluginBase): ClientPluginBase[] | void
      removePlugin(plugin: ClientPluginBase): ClientPluginBase[] | void
      rpcFunctions(): string[]
      rpcReflectionFunction(functionName: string): object
      rpcReflectionFunctions(FunctionNames: string[]): object
      rpcAllowedCrossSiteXHRSubdomains(): string[]
      enableLogging(): void
      disableLogging(): void
    }

    class RouterBase extends events.EventEmitter {
      constructor(jsonrpcServer: Server)
      connectionIDToSingletonClient<T extends Client | Server>(
        connectionID: number,
        ClientClass: T
      ): T
      onConnectionEnded(connectionID: number): void
    }

    interface IncomingRequest extends Request {
      readonly reverseCallsClient: Client
      /*writeonly*/ router: RouterBase

      // #region WAITING: https://github.com/Microsoft/TypeScript/issues/21759
      isAuthenticated: boolean
      connectionID: number | null
      isAuthorized: boolean
      endpoint: EndpointBase | null
      callResultToBeSerialized: object
      callResultSerialized: string | Buffer | object
      headers: object
      remoteAddress: string
      localAddress: string
      // #endregion

      new (): this
      toResponseObject(): {
        id: number | null
        jsonrpc: '2.0'
        error?: {
          message: string
          code: number
          data: string
        }
        result?: number | string | object | any[] | Error | null
      }
    }

    interface ServerPluginBase {
      new (): this
      beforeJSONDecode(incomingRequest: IncomingRequest): Promise<any>
      afterJSONDecode(incomingRequest: IncomingRequest): Promise<any>
      callFunction(incomingRequest: IncomingRequest): Promise<any>
      result(incomingRequest: IncomingRequest): Promise<any>
      exceptionCatch(incomingRequest: IncomingRequest): Promise<any>
      response(incomingRequest: IncomingRequest): Promise<any>
      afterSerialize(incomingRequest: IncomingRequest): Promise<any>
    }

    class Server extends events.EventEmitter {
      readonly endpoints: {[key: string]: EndpointBase}

      constructor()
      attachToHTTPServer(
        httpServer: http.Server,
        rootPath: string,
        sharedWithWebSocketServer: boolean
      ): Promise<void>
      registerEndpoint(endpoint: EndpointBase): void
      unregisterEndpoint(path: string): boolean
      addPlugin(plugin: ServerPluginBase): void
      removePlugin(plugin: ServerPluginBase): void
      processHTTPRequest(
        httpReques: http.IncomingMessage,
        httpResponse: http.ServerResponse
      ): Promise<IncomingRequest>
      processRequest(incomingRequest: IncomingRequest): Promise<null>
    }

    class BidirectionalWebsocketRouter extends RouterBase {
      addWebSocketSync(
        webSocket: WebSocket | ws,
        upgradeRequest?: http.IncomingMessage
      ): number
    }

    const Plugins: {
      Server: {
        [key: string]: ServerPluginBase
      }
      Client: {
        [key: string]: ClientPluginBase
      }
    }
  }
}
