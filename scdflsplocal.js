var os = require('os');
var fs = require('fs');
var path = require('path');
const homedir = os.homedir();
var dir = 'out';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const toPath = path.resolve(dir, 'spring-cloud-dataflow-language-server.jar');
const fromPath = path.resolve(homedir,
    '.m2',
    'repository',
    'org',
    'springframework',
    'cloud',
    'spring-cloud-dataflow-language-server',
    '0.0.1-BUILD-SNAPSHOT',
    'spring-cloud-dataflow-language-server-0.0.1-BUILD-SNAPSHOT.jar');

fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath));