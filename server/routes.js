const beautify = require('json-beautify');
const express = require('express')
const path = require('path');
const asyncHandler = require('express-async-handler')
const Client = require('kubernetes-client').Client;
const config = require('kubernetes-client').config;
const contextMap = {};

const router = express.Router();

function handleAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.error(error);
      res.status(500).json({ message: error.message });
    });
  };
}

router.get('/api/namespace/:namespace/deployments', handleAsync(async (req, res) => {
  const deployments = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments().get();
  res.json(deployments);
}));

router.get('/api/namespace/:namespace/deployments/:deployment/history', handleAsync(async (req, res) => {
  const deployment = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments(req.params.deployment).get();
  const replicaSets = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).replicasets.get(
    {qs: {labelSelector:labelsToQuery(deployment.body.metadata.labels)}}
  );
  res.json(replicaSets);
}));
  
router.post('/api/namespace/:namespace/deployments/:deployment', handleAsync(async (req, res) => {
  try {
    const updated = await getClient(req).apis.apps.v1.namespaces(req.params.namespace).deployments(req.params.deployment).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/pods', handleAsync(async (req, res) => {
  const pods = await getClient(req).api.v1.namespaces(req.params.namespace).pods().get();
  res.json(pods);
}));

router.get('/api/namespace/:namespace/customResources', handleAsync(async (req, res) => {
  const client = getClient(req);

  const customResourceDefinitions = await client.apis['apiextensions.k8s.io'].v1beta1.customresourcedefinitions.get();

  customResourceDefinitions.body.items.forEach(crd => {
    const { metadata, spec } = crd;
    if (client.__kubecle_custom_resource_definitions[metadata.selfLink]) {
      return;
    }
    client.addCustomResourceDefinition({
      apiVersion: 'apiextensions.k8s.io/v1beta1',
      kind: 'CustomResourceDefinition',
      metadata,
      spec,
    });
    client.__kubecle_custom_resource_definitions[metadata.selfLink] = true;
  });
  res.json(customResourceDefinitions);
}));

// todo: lock this down. this is probably a security hazard
router.get('/api/namespace/:namespace/customResources/:api/:version/:customResource', handleAsync(async (req, res) => {
  const customResources = await getClient(req).apis[req.params.api][req.params.version].namespaces(req.params.namespace)[req.params.customResource].get();
  res.json(customResources);
}));

router.get('/api/namespace/:namespace/hpas', handleAsync(async (req, res) => {
  const pods = await getClient(req).apis.autoscaling.v1.namespaces(req.params.namespace).hpa().get();
  res.json(pods);
}));

router.post('/api/namespace/:namespace/hpas/:hpa', handleAsync(async (req, res) => {
  try {
    const updated = await getClient(req).apis.autoscaling.v1.namespaces(req.params.namespace).hpa(req.params.hpa).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/pods/:pods/logs/:containerName?', handleAsync(async (req, res) => {
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


router.delete('/api/namespace/:namespace/pods/:podname', handleAsync(async (req, res) => {
  const pods = await getClient(req).api.v1.namespaces(req.params.namespace).pods(req.params.podname).delete();
  res.json(pods);
}));

router.get('/api/namespace/:namespace/services', handleAsync(async (req, res) => {
  const services = await getClient(req).api.v1.namespaces(req.params.namespace).services().get();
  res.json(services);
}));

router.post('/api/namespace/:namespace/services/:service', handleAsync(async (req, res) => {
  try {
    const updated = await getClient(req).api.v1.namespaces(req.params.namespace).services(req.params.service).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/configmaps', handleAsync(async (req, res) => {
  const configmaps = await getClient(req).api.v1.namespaces(req.params.namespace).configmaps().get();
  res.json(configmaps);
}));

router.post('/api/namespace/:namespace/configmaps/:configmap', handleAsync(async (req, res) => {
  try {
    const updated = await getClient(req).api.v1.namespaces(req.params.namespace).configmaps(req.params.configmap).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/namespace/:namespace/jobs', handleAsync(async (req, res) => {
  const jobs = await getClient(req).apis.batch.v1.namespaces(req.params.namespace).jobs().get();
  res.json(jobs);
}));

router.delete('/api/namespace/:namespace/jobs/:job', handleAsync(async (req, res) => {
  const job = await getClient(req).apis.batch.v1.namespaces(req.params.namespace).jobs(req.params.job).delete();
  res.json(job);
}));

router.get('/api/namespace/:namespace/cronjobs', handleAsync(async (req, res) => {
  const jobs = await getClient(req).apis.batch.v1beta1.namespaces(req.params.namespace).cronjobs().get();
  res.json(jobs);
}));

router.post('/api/namespace/:namespace/cronjobs/:cronjob', handleAsync(async (req, res) => {
  try {
    const updated = await getClient(req).apis.batch.v1beta1.namespaces(req.params.namespace).cronjobs(req.params.cronjob).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.delete('/api/namespace/:namespace/cronjobs/:cronjob', handleAsync(async (req, res) => {
  const pods = await getClient(req).apis.batch.v1beta1.namespaces(req.params.namespace).pods(req.params.cronjob).delete();
  res.json(pods);
}));

router.get('/api/namespace/:namespace/ingresses', handleAsync(async (req, res) => {
  const ingresses = await getClient(req).apis.extensions.v1beta1.namespaces(req.params.namespace).ingresses().get();
  res.json(ingresses);
}));

router.post('/api/namespace/:namespace/ingresses/:ingresses', handleAsync(async (req, res) => {
  try {
    const updated = await getClient(req).apis.extensions.v1beta1.namespaces(req.params.namespace).ingresses(req.params.ingresses).put({ body: req.body });
    res.json(updated);
  } catch (err) {
    if (err.statusCode !== 409) throw err;
  }
}));

router.get('/api/contexts', handleAsync(async (req, res) => {
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
      client.__kubecle_custom_resource_definitions = {};
      contextMap[contextKey] = client;
      return client;
    } else {
      let client = createClient(null);
      client.__kubecle_custom_resource_definitions = {};
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