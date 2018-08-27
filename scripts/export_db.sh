#!/usr/bin/env bash
DB="restgoose-db"
MONGO_HOST=${MONGO_HOST:-"127.0.0.1"}
MONGO_PORT=${MONGO_PORT:-27017}

#List collections
COLLECTIONS=$(mongo $MONGO_HOST:$MONGO_PORT/$DB --quiet --eval "db.getCollectionNames()" | sed 's/,/ /g' | sed 's/["[]//g' | sed 's/]//g')

for collection in $COLLECTIONS; do
    echo "Exporting $collection ..."
    
    # Export
    mongoexport --host $MONGO_HOST --port $MONGO_PORT -d $DB -c $collection -o dump/$collection.json
done
