#!/bin/bash

if [ "$#" -lt 4 ]; then
    echo "Usage: ./create_user.sh <email> <phone> <password> <role: admin|user>"
    echo "Example: ./create_user.sh admin@ciro.gov.pk +923001234567 adminpass admin"
    exit 1
fi

cd server
npx ts-node src/create_user.ts "$1" "$2" "$3" "$4"
