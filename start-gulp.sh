#!/bin/bash

docker run -it --rm  -v `pwd`/web/:/data/ nodejs-bower-gulp npm install

