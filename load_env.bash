#!/bin/bash

# Set ENV_FILE to the current working directory and look for .env there
ENV_FILE="$(pwd)/.env"

if [ -f "$ENV_FILE" ]; then
  echo "Loading environment variables from $ENV_FILE..."

  # Use `grep` to filter out lines starting with '#' (comments), remove spaces around '=', and then source the file
  grep -v '^#' "$ENV_FILE" | while IFS= read -r line; do
    line=$(echo "$line" | sed -e 's/^[[:space:]]*//')
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line"
    fi
  done

  echo "Environment variables loaded successfully."
else
  echo "$ENV_FILE not found in the current directory."
fi
