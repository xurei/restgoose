#!/usr/bin/env bash

# Overwritable args
MONGO_URI=${MONGO_URI:-"mongodb://127.0.0.1/restgoose-db"}

#List collections
COLLECTIONS=$(ls dump/*.json | sed 's/.json//g' | sed 's|dump/||g')
MONGO_URI="${MONGO_URI}?authSource=admin"

for collection in $COLLECTIONS; do
    echo "Importing $collection ..."
    
    # Import
    mongoimport --uri $MONGO_URI -c $collection --drop --file test/dumps/$collection.json
done
