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
  
    orders.push({
      name: props['Nickname'] || props['Name'],
      purchase: props['Product Summary']
        .replace('Gildan Ultra Cotton T-shirt - Unisex - Black: ', '')
        .replace(/Adult /g, '')
    });
  }
});

parser.on('finish', () => {
  console.log(JSON.stringify(orders, null, '  '));
})

parser.write(readFileSync(file));
parser.end();
