#!/bin/sh

set -e

echo "Starting nestjs app"
exec node dist/main.js
