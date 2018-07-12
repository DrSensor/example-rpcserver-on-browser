reverse-rpc
===========

[![Say Thanks!](https://img.shields.io/badge/Say%20Thanks-!-1EAEDB.svg)](https://saythanks.io/to/DrSensor)

PoC for changing behaviour of front-end application via CLI

# Usage
```console
$ reverse-rpc --help
Reverse RPC that can control webapp behaviour

USAGE
  $ reverse-rpc CONTENT

ARGUMENTS
  CONTENT  .html file or directory that contain .html component that want to be served.
           Default is `index.html` if it's directory

OPTIONS
  -c, --cdn=cdn  inject script tag of URL of the external script (CDN)
  --open         open browser on start
```

# Install
```bash
git clone https://github.com/DrSensor/example-rpcserver-on-browser.git
cd example-rpcserver-on-browser
npm install
sudo npm link
```

# License
[CDDL 1.0](https://opensource.org/licenses/CDDL-1.0)
