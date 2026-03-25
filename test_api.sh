#!/bin/bash
# Test API to check totalReceived value
ADDRESS="test$(date +%s)@sutemeado.com"
PASSWORD="testpass123"

# Create address
echo "Creating address..."
CREATE_RES=$(curl -s "http://localhost:3000/api/new-address")
echo "Create response: $CREATE_RES"

ADDR=$(echo $CREATE_RES | grep -o '"address":"[^"]*"' | cut -d'"' -f4)
PASS=$(echo $CREATE_RES | grep -o '"password":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADDR" ]; then
    echo "Failed to create address"
    exit 1
fi

echo "Created: $ADDR"

# Login and check totalReceived
echo ""
echo "Checking login response..."
LOGIN_RES=$(curl -s -X POST "http://localhost:3000/api/login" \
    -H "Content-Type: application/json" \
    -d "{\"address\":\"$ADDR\",\"password\":\"$PASS\"}")
echo "Login response: $LOGIN_RES"
