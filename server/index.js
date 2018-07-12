const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const path = require('path');
const beautify = require('json-beautify');
const asyncHandler = require('express-async-handler')
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const client = new Client({ config: config.fromKubeconfig(), version: '1.9' });

app.use(express.static(path.join(__dirname, '/../client/dist')));
app.use(bodyParser.json());

app.get('/api/namespace/', asyncHandler(async (req, res) => {
  const deployments = await client.apis.apps.v1.namespaces().get();
  res.json(deployments);
}));

app.get('/api/namespace/:namespace/deployments', asyncHandler(async (req, res) => {
  const deployments = await client.apis.apps.v1.namespaces(req.params.namespace).deployments().get();
  res.json(deployments);
}));

app.post('/api/namespace/:namespace/deployments/:deployment', asyncHandler(async (req, res) => {
  try {
    const updated = await client.apis.apps.v1.namespaces(req.params.namespace).deployments(req.params.deployment).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

app.get('/api/namespace/:namespace/pods', asyncHandler(async (req, res) => {
  const pods = await client.api.v1.namespaces(req.params.namespace).pods().get();
  res.json(pods);
}));

app.get('/api/namespace/:namespace/pods/:pods/logs/:containerName?', asyncHandler(async (req, res) => {
  const logs = await client.api.v1.namespaces(req.params.namespace).pods(req.params.pods).log.get({
    qs: { container: req.params.containerName }
  });
  lines = logs.body.split('\n').map(s => { 
    try {
      return beautify(JSON.parse(s), null, 2, 80);
    } catch (e) {
      return s;
    }
  });
  res.contentType("application/text");
  res.send(lines.join('\n'));
}));

app.delete('/api/namespace/:namespace/pods/:podname', asyncHandler(async (req, res) => {
  const pods = await client.api.v1.namespaces(req.params.namespace).pods(req.params.podname).delete();
  res.json(pods);
}));

app.get('/api/namespace/:namespace/services', asyncHandler(async (req, res) => {
  const pods = await client.api.v1.namespaces(req.params.namespace).services().get();
  res.json(pods);
}));

var server = app.listen(process.env.PORT || 6888, async () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Kubecle listening at http://%s:%s', host, port);
});