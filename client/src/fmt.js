import * as _ from 'lodash';

module.exports = {
    imageVersion: function(image) {
        const imgStr = image.includes('/') ? image.split('/')[1] : image;
        const parts = imgStr.split(':');
        const imageName = parts.length > 1 ? parts[1] : parts[0];
        return imageName
    },
    imageName: function(image) {
        return image.includes('/') ? image.split('/')[1]:image;
    },
    ports: function(ports) {
        return ports && ports.map(p => p && p.containerPort + '/' + p.protocol);
    },
    containerImageNames: function(containers) {
        return containers && containers.map(c => this.imageName(c.image));
    },
    containerPorts: function(containers) {
        return containers && _.flatMap(containers, c => this.ports(c.ports));
    },
    ingressHost: function(rules) {
        return rules.map(r => r.host);
    },
    servicePorts: function(ports) {
        return ports && ports.map(p => p && p.port + ':' + p.targetPort + '/' + p.protocol);
    },
    cpu: function(containers) {
        return containers && containers.map(c => [_.get(c, 'resources.requests.cpu'), _.get(c, 'resources.limits.cpu')].join('/'));
    },
    memory: function(containers) {
        return containers && containers.map(c => [_.get(c, 'resources.requests.memory'), _.get(c, 'resources.limits.memory')].join('/'));
    },
}