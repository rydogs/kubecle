# kubecle
Kubecle is a web ui running locally to provides useful information to your kubernettes cluster.

- [x] Pods
- [x] Deployments
- [x] Services
- [ ] Ingress
- [ ] Endpoints
- [ ] Accounts
- [ ] Config
- [ ] Secrets

It also allows you to perform some basic actions:
- [x] Delete pods
- [x] View logs
- [x] Describe
- [ ] Edit
- [ ] Switch clusters
- [ ] Apply manifest

## How to use
1. Run `kubectl config use-context <context>` to set default context
2. `npm install && npm --prefix client install && npm start`
3. Open browser to http://localhost:6888/?#/pods
4. Update namespace on the up right corner as needed

## Stack
* React
* [Material UI](https://material-ui.com/)
* [kubernetes-client](https://github.com/godaddy/kubernetes-client)
* [react-ace](https://github.com/securingsincity/react-ace) editor
* [react-lazylog](https://github.com/mozilla-frontend-infra/react-lazylog) log viewer

## Screenshots
![Pods](/screenshot/pods.png)

![Logs](/screenshot/logs.png)

![Describe](/screenshot/describe.png)
