var fs = require('fs');
var path = require('path');
var dir = 'out';
var mvn = require('./node_modules/mvn-artifact-download/lib/artifact-download.js');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const out = path.resolve(dir);
mvn.default('org.springframework.cloud:spring-cloud-dataflow-language-server:0.0.1-BUILD-SNAPSHOT', out, 'https://repo.spring.io/libs-snapshot/', 'spring-cloud-dataflow-language-server.jar');
