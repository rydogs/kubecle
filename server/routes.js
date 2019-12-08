const beautify = require('json-beautify');
const express = require('express')
const path = require('path');
const asyncHandler = require('express-async-handler')
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const contextMap = {};

const router = express.Router()

router.get('/api/namespace/:namespace/deployments', asyncHandler(async (req, res) => {
  const deployments = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments().get();
  res.json(deployments);
}));

router.get('/api/namespace/:namespace/deployments/:deployment/history', asyncHandler(async (req, res) => {
  const deployment = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments(req.params.deployment).get();
  const replicaSets = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).replicasets.get(
    {qs: {labelSelector:labelsToQuery(deployment.body.metadata.labels)}}
  );
  res.json(replicaSets);
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

router.get('/api/namespace/:namespace/hpas', asyncHandler(async (req, res) => {
  const pods = await getClient(req).apis.autoscaling.v1.namespaces(req.params.namespace).hpa().get();
  res.json(pods);
}));

router.post('/api/namespace/:namespace/hpas/:hpa', asyncHandler(async (req, res) => {
  try {
    const updated = await  getClient(req).apis.autoscaling.v1.namespaces(req.params.namespace).hpa(req.params.hpa).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/pods/:pods/logs/:containerName?', asyncHandler(async (req, res) => {
  const stream = await getClient(req).api.v1.namespaces(req.params.namespace).pods(req.params.pods).log.getStream({
    qs: { tailLines: 100, follow: true, container: req.params.containerName }
  });

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  stream.on('data', data => {
    lines = data.toString().split('\n').map(s => {
      try {
        return beautify(JSON.parse(s), null, 2, 80);
      } catch (e) {
        return s;
      }
    });
    res.write(lines.join('\n'));
  });
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
    const updated = await getClient(req).api.v1.namespaces(req.params.namespace).services(req.params.service).put({ body: req.body });
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
    const updated = await getClient(req).api.v1.namespaces(req.params.namespace).configmaps(req.params.configmap).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/jobs', asyncHandler(async (req, res) => {
  const jobs = await getClient(req).apis.batch.v1.namespaces(req.params.namespace).jobs().get();
  res.json(jobs);
}));

router.delete('/api/namespace/:namespace/jobs/:job', asyncHandler(async (req, res) => {
  const job = await getClient(req).apis.batch.v1.namespaces(req.params.namespace).jobs(req.params.job).delete();
  res.json(job);
}));

router.get('/api/namespace/:namespace/cronjobs', asyncHandler(async (req, res) => {
  const jobs = await getClient(req).apis.batch.v1beta1.namespaces(req.params.namespace).cronjobs().get();
  res.json(jobs);
}));

router.post('/api/namespace/:namespace/cronjobs/:cronjob', asyncHandler(async (req, res) => {
  try {
    const updated = await getClient(req).apis.batch.v1beta1.namespaces(req.params.namespace).cronjobs(req.params.cronjob).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.delete('/api/namespace/:namespace/cronjobs/:cronjob', asyncHandler(async (req, res) => {
  const pods = await getClient(req).apis.batch.v1beta1.namespaces(req.params.namespace).pods(req.params.cronjob).delete();
  res.json(pods);
}));

router.get('/api/namespace/:namespace/ingresses', asyncHandler(async (req, res) => {
  const ingresses = await getClient(req).apis.extensions.v1beta1.namespaces(req.params.namespace).ingresses().get();
  res.json(ingresses);
}));

router.post('/api/namespace/:namespace/ingresses/:ingresses', asyncHandler(async (req, res) => {
  try {
    const updated = await getClient(req).apis.extensions.v1beta1.namespaces(req.params.namespace).ingresses(req.params.ingresses).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/contexts', asyncHandler(async (req, res) => {
  const k8sConfig = config.loadKubeconfig();
  res.json({"currentContext": k8sConfig['current-context'], "contexts": k8sConfig.contexts.map(c => c.name)});
}));

router.get('/*', function(req, res) { 
  res.sendFile(path.resolve(__dirname + '/../client/dist/index.html'));
});

function getClient(req) {
  let contextHeader = req.headers['k8s-context'];
  let contextKey = contextHeader || 'k8s-default';
  if (contextMap[contextKey]) {
    return contextMap[contextKey];
  } else {
    if (contextHeader) {
      let client = createClient(contextHeader);
      contextMap[contextKey] = client;
      return client;
    } else {
      let client = createClient(null);
      contextMap['k8s-default'] = client;
      return client;
    }
  }
}

function createClient(context) {
  let client = new Client({ config: config.fromKubeconfig(null, context), version: '1.10'});
  return client;
}

function labelsToQuery(labels) {
  return Object.keys(labels).map(label => `${label}=${labels[label]}`).join(',')
}

module.exports = router