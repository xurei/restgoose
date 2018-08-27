#!/usr/bin/env bash

# Change default port of mongodb and node
MONGO_HOST=${MONGO_HOST:-"127.0.0.1"}
MONGO_PORT=27018
NODE_PORT=8123
CONTAINER_NAME="restgooseTest"

# realpath function for macos
realpath() {
    path=`eval echo "$1"`
    folder=$(dirname "$path")
    echo $(cd "$folder"; pwd)/$(basename "$path"); 
}
DIR=$(dirname $(realpath $0))

# --no-docker argument
WITH_DOCKER=1
if [ "$1" == "--no-docker" ]; then
    WITH_DOCKER=0
    MONGO_PORT=27017
fi

# Build Mongo URI 
MONGO_URI="mongodb://${MONGO_HOST}:${MONGO_PORT}/restgoose-db"

# Detect OS
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac
echo "OS: ${machine}"

if [ "$machine" == "MinGw" ]; then
    echo "MinGw detected"
    DIR=$(echo $DIR | sed 's|/c/|c:/|')
fi

# Start a database using docker
    if [ $WITH_DOCKER -eq "1" ]; then
        # Check that the container exists
        IS_CREATED=$(docker ps -a | grep "$CONTAINER_NAME")
        IS_RUNNING=$(docker ps    | grep "$CONTAINER_NAME")
        
        if [[ ! -z  $IS_RUNNING  ]]; then
            echo 'Container already started';
        else 
            if [[ ! -z $IS_CREATED  ]]; then
                docker start $CONTAINER_NAME
            else
                docker run --name $CONTAINER_NAME -d -p $MONGO_PORT:27017 mongo:3.7.2
            fi
        fi
    fi
    
# Populate the database
    MONGO_URI=$MONGO_URI bash $(dirname $0)/import_db.sh

# Start node with a custom port
    echo "Starting server..."
    NODE_ENV=development DB_URI=$MONGO_URI PORT=$NODE_PORT npm run serve > server_logs.log 2> server_errors.log &
    NODE_PID=$!
    sleep 4
    
# Run the rest test
    echo "Starting test..."
    NODE_PORT=$NODE_PORT $DIR/../node_modules/.bin/mocha --opts $DIR/../mocha.opts $DIR/../tests/**/*.tsx
    OUT=$?
    
# Kill the node service    
    kill $NODE_PID
    
# Stop and remove docker container
    if [ $WITH_DOCKER -eq "1" ]; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi

exit $OUT
