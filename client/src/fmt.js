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
        return ports && ports.map(p => p.containerPort + '/' + p.protocol);
    },
    containerImageNames: function(containers) {
        return containers && containers.map(c => this.imageName(c.image));
    },
    containerPorts: function(containers) {
        return containers && containers.flatMap(c => this.ports(c.ports));
    },
    ingressHost: function(rules) {
        return rules.map(r => r.host).join(', ');
    },
    servicePorts: function(ports) {
        return ports && ports.map(p => p.port + ':' + p.targetPort + '/' + p.protocol);
    }
}