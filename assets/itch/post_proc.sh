#!/bin/bash

sed -i 's/<message/\&#x003c;message/' $1
sed -i 's/<field/\&#x003c;field/' $1

