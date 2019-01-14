#!/usr/bin/env bash

rm -R _site || 0

docker build -t restgoose-doc docs 

docker run --rm --label="restgoose-doc" --volume=$(pwd):/srv/jekyll \
  -it -p 127.0.0.1:4000:4000 restgoose-doc bash docs/serve.sh
