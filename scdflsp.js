var fs = require('fs');
var path = require('path');
var dir = 'out';
const mvn = require('./node_modules/maven-repository-manager/dist/index.js');
const snapshotRepository = new mvn.RemoteRepository({baseUrl: 'https://repo.spring.io/libs-snapshot'});
const repositoryManager = new mvn.RepositoryManager({remoteRepositories: [snapshotRepository]});
const artifact = mvn.Artifact.from('org.springframework.cloud:spring-cloud-dataflow-language-server:0.0.1-BUILD-SNAPSHOT');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
repositoryManager.download(artifact)
    .then(readable => readable.pipe(fs.createWriteStream(path.resolve(dir, 'spring-cloud-dataflow-language-server.jar'))));
