import { parse } from 'csv';
import { readFileSync } from 'fs';
import path from 'path';
import transform from 'stream-transform';

let header = null;
const orders = [];
const file = path.resolve('.', process.argv[2]);

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
  
    orders.push({
      name: (props['Nickname'] || props['Name']).trimEnd(),
      donation: props['Donation'],
      purchases
    });
  }
});

parser.on('finish', () => {
  console.log(JSON.stringify(orders, null, '  '));
})

parser.write(readFileSync(file));
parser.end();
