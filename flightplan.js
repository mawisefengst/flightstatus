var plan = require('flightplan');

var appName = 'flightstats';
var username = 'deploy';
var startFile = 'serve.js';
var password = 'R3htJq!1';

var tmpDir = appName+'-' + new Date().getTime();

// configuration
plan.target('staging', [
  {
    host: '67.207.85.160',
    username: username,
    password: password,
    agent: process.env.SSH_AUTH_SOCK
  }
]);

/*scp ~/.ssh/id_rsa.pub root@67.207.85.160:~/.ssh/authorized_keys*/

plan.target('production', [
  {
    host: '67.207.85.160',
    username: username,
    password: password,
    agent: process.env.SSH_AUTH_SOCK
  },
//add in another server if you have more than one
// {
//   host: '104.131.93.216',
//   username: username,
//   agent: process.env.SSH_AUTH_SOCK
// }
]);

// run commands on localhost
plan.local(function(local) {
  // uncomment these if you need to run a build on your machine first
  // local.log('Run build');
  // local.exec('gulp build');

  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');
  remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});

  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.exec('sudo restart flightstats-app');
  //remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
  //remote.exec('forever stopall');
  //remote.exec('forever start --minUptime 1000 --spinSleepTime 1000 ~/'+appName+'/'+startFile);
});