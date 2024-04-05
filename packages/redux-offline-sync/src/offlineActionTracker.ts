const subscriptions = {};

function registerAction(transaction) {
  return new Promise((resolve, reject) => {
    subscriptions[transaction] = { resolve, reject };
  });
}

function resolveAction(transaction, value) {
  const subscription = subscriptions[transaction];
  if (subscription) {
    subscription.resolve(value);
    delete subscriptions[transaction];
  }
}

function rejectAction(transaction, error) {
  const subscription = subscriptions[transaction];
  if (subscription) {
    subscription.reject(error);
    delete subscriptions[transaction];
  }
}

export { registerAction, resolveAction, rejectAction };
