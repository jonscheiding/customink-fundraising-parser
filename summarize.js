import path from 'path';

const file = path.resolve('.', process.argv[2]);

const orders = require(file);
const summary = {};

for(let order of orders) {
  let purchases = order.purchase.split(',').map(i => i.trim());
  for(let purchase of purchases) {
    const [ count, size ] = purchase.split(' - ');
    summary[size] = (summary[size] || 0) + Number(count);
  }
}

console.log(JSON.stringify({ orders, summary }, null, '  '));