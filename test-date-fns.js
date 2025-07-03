// Test file to verify date-fns import
const { formatDistanceToNow } = require('date-fns');

console.log('formatDistanceToNow function:', typeof formatDistanceToNow);
console.log('Test result:', formatDistanceToNow(new Date(), { addSuffix: true }));