# kubecle
Kubecle provides useful information to your kubernettes cluster.

- [x] Pods
- [x] Deployments
- [x] Services
- [ ] Ingress
- [ ] Endpoints
- [ ] Accounts
- [ ] Config
- [ ] Secrets

It also allows you to perform some basic actions:
- Delete pods
- View logs


## How to use
1. Run `kubectl config use-context <context>` to set default context
2. `npm install && npm --prefix client install && npm start`
3. Open browser to http://localhost:6888/?#/pods
4. Update namespace on the up right corner as needed
