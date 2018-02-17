import path from 'path';

const file = path.resolve('.', process.argv[2]);

const orders = require(file);
const summary = {};

for(let order of orders) {
  for(let purchase of order.purchases) {
    const { size, count } = purchase;
    summary[size] = (summary[size] || 0) + count;
  }
}

console.log(JSON.stringify({ orders, summary }, null, '  '));
