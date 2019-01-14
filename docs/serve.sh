#!/usr/bin/env bash

DIR=$(dirname $(realpath $0))

cp -Rf /dependencies/* .

jekyll s --incremental --source $DIR
