/**
 * ObeliskClient
 *
 * Manages connections to an obelisk server.
 */
function ObeliskClient() {
  this.nonce = 0;
  this.initWebSocket("ws://85.25.198.97:8888")
};

/**
 * test
 *
 * Perform some tests
 */

ObeliskClient.prototype.test = function() {
  this.getHistory('1Fufjpf9RM2aQsGedhSpbSCGRHrmLMJ7yY', function(res){
      var rows = res[0],
          balance = 0;
      for(var idx=0; idx<rows.length; idx++) {
        var entry = rows[idx];
        if (entry[6] == 0xffffffff) {
            balance += entry[3];
        }
      }
      console.log('History arrived:', res, 'balance', balance, res.length)
  });
  this.getLastHeight(function(res){console.log('Height arrived', res)});
  this.subscribeAddress('1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp', function(res){console.log('Subscribe ok', res)});
}

/**
 * initWebSocket
 *
 * Initializes websocket communications
 *  * address: websocket url
 */
ObeliskClient.prototype.initWebSocket = function(address) {
  var self = this,
      ws   = new WebSocket(address);

  ws.onopen = function(event) {self.test(event)};
  ws.onmessage = function(event) {self.onMessage(event)};
  this.socket = ws;
  this.callbacks = {};
}

/**
 * Send a command to the server.
 *  * command: command to send
 *  * data: extra data
 *  * success: success callback
 *  * error: error callback
 */
ObeliskClient.prototype.send = function(command, data, success, error) {
  this.nonce += 1;
  msg = {'command': command, 'id': this.nonce};
  if (data) {
    msg['data'] = data;
  }
  this.callbacks[this.nonce] = [success, error];

  this.socket.send(JSON.stringify(msg));
}

/**
 * Message arriving from the server
 *  * event: Incoming event
 */
ObeliskClient.prototype.onMessage = function(event) {
  var msg = JSON.parse(event.data);

  if (this.callbacks[msg.id]) {
    if (this.callbacks[msg.id][0]) {
      this.callbacks[msg.id][0](msg.result);
    }
    delete this.callbacks[msg.id];
  } else {
    console.log('unhandled message', msg)
  }
}

/**
 * Get last height
 *  * success: success callback
 *  * error: error callback
 */
ObeliskClient.prototype.getLastHeight = function(success, error) {
  this.send('fetch_last_height', false, success, error);
}

/**
 * Get history for an address
 *  * address: bitcoin address
 *  * success: success callback
 *  * error: error callback
 */
ObeliskClient.prototype.getHistory = function(address, success, error) {
  this.send("fetch_history", {address: address}, success, error);
}

/**
 * Subscribe to address notifications
 *  * address: bitcoin address
 *  * success: success callback
 *  * error: error callback
 */
ObeliskClient.prototype.subscribeAddress = function(address, success, error) {
  this.send("subscribe_address", {address: address}, success, error);
}


/**
 * Initialize an obelisk client
 */
client = new ObeliskClient()

