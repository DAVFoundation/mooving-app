/* tslint:disable */
const patchPostMessageFunction = function() {
    var originalPostMessage = window.postMessage;
    var patchedPostMessage = function(message, targetOrigin, transfer) {
      originalPostMessage(message, targetOrigin, transfer);
    };

    patchedPostMessage.toString = function() {
      return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
    };

    window.postMessage = patchedPostMessage;
  };

const patchPostMessageCode = '(' + String(patchPostMessageFunction) + ')();';

export default patchPostMessageCode;
