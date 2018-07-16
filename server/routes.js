const beautify = require('json-beautify');
const express = require('express')
const asyncHandler = require('express-async-handler')
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const contextMap = {};

const router = express.Router()

router.get('/api/namespace/:namespace/deployments', asyncHandler(async (req, res) => {
  const deployments = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments().get();
  res.json(deployments);
}));
  
router.post('/api/namespace/:namespace/deployments/:deployment', asyncHandler(async (req, res) => {
  try {
    const updated = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments(req.params.deployment).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/pods', asyncHandler(async (req, res) => {
  const pods = await getClient(req).api.v1.namespaces(req.params.namespace).pods().get();
  res.json(pods);
}));

router.get('/api/namespace/:namespace/pods/:pods/logs/:containerName?', asyncHandler(async (req, res) => {
  const logs = await getClient(req).api.v1.namespaces(req.params.namespace).pods(req.params.pods).log.get({
    qs: { container: req.params.containerName }
  });
  if (typeof logs.body === 'string') {
    lines = logs.body.split('\n').map(s => {
      try {
        return beautify(JSON.parse(s), null, 2, 80);
      } catch (e) {
        return s;
      }
    });
    res.contentType("application/text");
    res.send(lines.join('\n'));
  } else {
    res.contentType("application/text");
    res.send(logs.body);
  }
}));

router.delete('/api/namespace/:namespace/pods/:podname', asyncHandler(async (req, res) => {
  const pods = await getClient(req).api.v1.namespaces(req.params.namespace).pods(req.params.podname).delete();
  res.json(pods);
}));

router.get('/api/namespace/:namespace/services', asyncHandler(async (req, res) => {
  const services = await getClient(req).api.v1.namespaces(req.params.namespace).services().get();
  res.json(services);
}));

router.post('/api/namespace/:namespace/services/:service', asyncHandler(async (req, res) => {
  try {
    const updated = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).services(req.params.service).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/configmaps', asyncHandler(async (req, res) => {
  const configmaps = await getClient(req).api.v1.namespaces(req.params.namespace).configmaps().get();
  res.json(configmaps);
}));

router.post('/api/namespace/:namespace/configmaps/:configmap', asyncHandler(async (req, res) => {
  try {
    const updated = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).configmaps(req.params.configmap).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/contexts', asyncHandler(async (req, res) => {
  const k8sConfig = config.loadKubeconfig();
  res.json({"currentContext": k8sConfig['current-context'], "contexts": k8sConfig.clusters.map(c => c.name)});
}));

function getClient(req) {
  let contextHeader = req.headers['k8s-context'];
  let contextKey = contextHeader || 'k8s-default';
  if (contextMap[contextKey]) {
    return contextMap[contextKey];
  } else {
    if (contextHeader) {
      let client = new Client({ config: config.fromKubeconfig(null, contextHeader), version: '1.9' });
      contextMap[contextKey] = client;
      return client;
    } else {
      let client = new Client({ config: config.fromKubeconfig(), version: '1.9' });
      contextMap['k8s-default'] = client;
      return client;
    }
  }
}

module.exports = router