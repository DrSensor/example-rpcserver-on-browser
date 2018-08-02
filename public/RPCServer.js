const JSONRPC = require('jsonrpc-bidirectional');
export const EndpointBase = JSONRPC.EndpointBase;

class DOMPlugin extends JSONRPC.ServerPluginBase {
  constructor(elementsGenerator) {
    super();
    this.getElements = elementsGenerator;
  }

  callFunction(incomingRequest) {
    const {endpoint, requestObject:{method, params}} = incomingRequest;
    if (typeof endpoint[method] !== 'function') {
      incomingRequest.endpoint[method] = () => this.getElements().map(
        el => el.setAttribute(method, params[0])
      );
    }
  }
}

let _registered, _DOMPlugin;
let _server = new JSONRPC.Server();
// By default, JSONRPC.Server rejects all requests as not authenticated and not authorized.
_server.addPlugin(new JSONRPC.Plugins.Server.AuthenticationSkip());
_server.addPlugin(new JSONRPC.Plugins.Server.AuthorizeAll());

export default class {
  constructor(path) {
    let url = new URL(path, `ws://${window.location.host}`)
    this.websocket = new WebSocket(url);

    let wsJSONRPCRouter = new JSONRPC.BidirectionalWebsocketRouter(_server);
    wsJSONRPCRouter.addWebSocketSync(this.websocket);
  }

  close(message) {
    this.websocket.close(1001, message);
    _registered = false;
  }

  static get registered() {return _registered}

  static register(endpoint, elementsGenerator) {
    if (_DOMPlugin) { // ↙️ cleanup
      _server.unregisterEndpoint(endpoint);
      _server.removePlugin(_DOMPlugin);
    }
    else _DOMPlugin = new DOMPlugin(elementsGenerator);

    _server.registerEndpoint(endpoint);
    _server.addPlugin(_DOMPlugin);
    _registered = true;
  }
}
