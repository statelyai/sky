#!/bin/bash

# This script copies the source code of the packages in the packages/ directory
# to the node_modules/@statelyai/ directory of each destination project.

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Split the DEV_DESTINATIONS variable into an array
IFS=',' read -r -a destinations <<<"$DEV_DESTINATIONS"

# Parallel arrays for source and target package names
source_packages=("sky-core" "sky-react")
target_packages=("sky" "sky-react")

# Ensure source and target arrays have the same length
if [ ${#source_packages[@]} -ne ${#target_packages[@]} ]; then
  echo "Source and target package arrays do not match in length."
  exit 1
fi

for i in "${!source_packages[@]}"; do
  source=${source_packages[i]}
  target=${target_packages[i]}
  for destination in "${destinations[@]}"; do
    echo "Copying ${source} to ${destination} as ${target}"
    rm -rf "${destination}/node_modules/@statelyai/${target}"
    cp -r "packages/${source}/" "${destination}/node_modules/@statelyai/${target}"
  done
done
