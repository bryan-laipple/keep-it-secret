'use strict';

const processEvent = (event, context) => () => console.log(`TODO process event`);

const success = callback => () => callback(null, `Success`);
const failure = callback => err => callback(err);

exports.handler = (event, context, callback) =>
  Promise.resolve()
    .then(processEvent(event, context))
    .then(success(callback))
    .catch(failure(callback));
