import { formatDistanceToNow } from 'date-fns';

console.log('Function type:', typeof formatDistanceToNow);
console.log('Test result:', formatDistanceToNow(new Date(), { addSuffix: true }));