import { parse } from 'csv';
import { readFileSync } from 'fs';
import path from 'path';
import transform from 'stream-transform';

let header = null;
const orders = [];
const file = path.resolve('.', process.argv[2]);

if (!Array.prototype.last) {
  Array.prototype.last = function(){
      return this[this.length - 1];
  };
};

var parser = parse();
parser.on('readable', () => {
  let record;
  while(record = parser.read()) {
    if(header == null) {
      header = record;
      continue;
    }
    
    const props = {};
    for(let i = 0; i < record.length; i++) {
      props[header[i]] = record[i];
    }
  
    if(props['Shipping Type'] != 'Bulk ship') {
      continue;
    }

    const match = props['Product Summary']
      .match(/(.*) - (.*) - (.*)\: (?:(\d+) - (.+?), )*(\d+) - (.+)/);

    if(!match) {
      console.error(`Couldn't understand product summary: "${props['Product Summary']}".`);
    }

    const [ fullMatch, productName, gender, color ] = match.splice(0, 4);
    const purchases = [];
    while (match.length > 0) {
      const [ count, size ] = match.splice(0, 2);
      if (!count) { continue; }

      purchases.push ( { count: Number(count), size } );
    }

    const name = (props['Nickname'] || props['Name']).trimEnd();
    const lastName = name.split(' ').last();
  
    orders.push({ name, lastName, purchases });
  }
});

parser.on('finish', () => {
  orders.sort((a, b) => a.lastName.localeCompare(b.lastName));

  const summary = {};

  for(let order of orders) {
    for(let purchase of order.purchases) {
      const { size, count } = purchase;
      summary[size] = (summary[size] || 0) + count;
    }
  }

  console.log(JSON.stringify({ 
    orders, 
    summary: Object.keys(summary).map(key => ({size: key, count: summary[key]})) 
  }, null, '  '));
});

parser.write(readFileSync(file));
parser.end();
