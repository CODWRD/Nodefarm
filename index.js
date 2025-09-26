const fs = require('fs');
const http = require('http');
const { json } = require('stream/consumers');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////
//FILES
//Blocking, synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// // console.log('file written');

//Non-blocking, asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   if (err) return console.log('error');
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data2}`, 'utf-8', err => {
//         console.log('Your file file has been written');
//       });
//     });
//   });
// });
// console.log('will read file');

///////////////////////////////////
//SERVER
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
const slugs = dataObj.map(el => slugify(el.productName), { lower: true });
// console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  console.log(url.parse(req.url, true));

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'content-type': 'text/html',
    });

    const cardHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');

    const output = tempOverview.replace('{%PRODUCT_CARD%}', cardHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'content-type': 'text/html',
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API page
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'content-type': 'text/html',
      'my-ownHeader': 'Hello-world',
    });
    res.end('<h1>Page cannot be found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to request on port 8000');
});
