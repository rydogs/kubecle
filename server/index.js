const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const routes = require('./routes')

const app = express();

app.use(express.static(path.join(__dirname, '/../client/dist')));
app.use(bodyParser.json());
app.use('/', routes);

var server = app.listen(process.env.PORT || 23333, '127.0.0.1', async () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Kubecle listening at http://%s:%s', host, port);
});