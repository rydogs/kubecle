<img src="/client/src/images/kubecle-logo.png" width="100">

# kubecle [![Build Status](https://travis-ci.org/rydogs/kubecle.svg?branch=master)](https://travis-ci.org/rydogs/kubecle) [![Dependency Status](https://david-dm.org/rydogs/kubecle.svg)](https://david-dm.org/rydogs/kubecle.svg)
Kubecle is a web ui running locally that provides useful information about your kubernetes cluster.

- [x] Pods
- [x] Deployments
- [x] Services
- [x] Config map
- [ ] Ingress
- [ ] Endpoints
- [ ] Accounts
- [ ] Secrets

It also allows you to perform some basic actions:
- [x] Delete pods
- [x] View logs
- [x] Describe
- [x] Edit
- [x] Switch clusters
- [ ] Apply manifest

## How to use
1. Run `kubectl config use-context <context>` to set default context
2. `npm install && npm start`
3. Open browser to http://localhost:6888/?#/pods
4. Update namespace on the up right corner as needed

## How to develop
1. Install [minikube](https://github.com/kubernetes/minikube)
2. Run `npm run watch` to start server
3. Run `npm --prefix client start` to start client
4. Open http://localhost:3001

## Stack
* React
* [Material UI](https://material-ui.com/)
* [kubernetes-client](https://github.com/godaddy/kubernetes-client)
* [react-ace](https://github.com/securingsincity/react-ace) editor
* [react-lazylog](https://github.com/mozilla-frontend-infra/react-lazylog) log viewer

## Screenshots
![Pods](/screenshot/pods.png)

![Services](/screenshot/service.png)

![Config maps](/screenshot/configmap.png)

![Logs](/screenshot/logs.png)

![Describe](/screenshot/describe.png)
