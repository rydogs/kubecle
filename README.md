<img src="/client/src/images/kubecle-logo.png" width="100">

# kubecle [![Build Status](https://travis-ci.org/rydogs/kubecle.svg?branch=master)](https://travis-ci.org/rydogs/kubecle) [![Dependency Status](https://david-dm.org/rydogs/kubecle.svg)](https://david-dm.org/rydogs/kubecle.svg)
Kubecle is a web ui running locally that provides useful information about your kubernetes cluster.  It is an alternative to [Kubernetes Dashboard](https://github.com/kubernetes/dashboard).  Because it runs locally, you can access any kubernetes clusters you have access to at a single place

- [x] Pods
- [x] Deployments
- [x] Services
- [x] Config map
- [x] Jobs
- [x] Ingress
- [x] HPA
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
* Download binary
  * [MacOS](https://github.com/rydogs/kubecle/releases/latest)
* Run locallly
  1. `npm install && npm start`
  2. Open browser to http://localhost:23333

## How to develop
1. Install kubernetes for Docker (18.06 or above) [MacOS](https://docs.docker.com/docker-for-mac/#kubernetes) [Windows](https://docs.docker.com/docker-for-windows/kubernetes/).  Alternatively, install [minikube](https://github.com/kubernetes/minikube)
2. Install [helm](https://github.com/helm/helm) and deploy something, for example, [Wordpress](https://github.com/helm/charts/tree/master/stable/wordpress)
3. Run `npm run watch` to start server
4. Run `npm --prefix client start` to start client
5. Open http://localhost:3001

## How to release
This project uses [release-it](https://github.com/webpro/release-it).  Make sure it is installed globally and run `release-it` to create a draft release.

## Stack
* React
* [Material UI](https://material-ui.com/)
* [kubernetes-client](https://github.com/godaddy/kubernetes-client)
* [react-ace](https://github.com/securingsincity/react-ace) editor
* [react-lazylog](https://github.com/mozilla-frontend-infra/react-lazylog) log viewer
* [material-table](https://github.com/mbrn/material-table)

## Screenshots
![Pods](/screenshot/pods.png)

![Services](/screenshot/service.png)

![Config maps](/screenshot/configmap.png)

![Logs](/screenshot/logs.png)

![Describe](/screenshot/describe.png)
