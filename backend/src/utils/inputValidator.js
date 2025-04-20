exports.validateChatInput = (input) => {
    // validation: Check that message is a string and deviceId is provided.
    if (!input || typeof input.message !== 'string' || !input.deviceId) {
      return false;
    }
    return true;
  };
  