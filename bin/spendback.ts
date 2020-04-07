#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SpendbackStack } from '../lib/spendback-stack';

const app = new cdk.App();
new SpendbackStack(app, 'SpendbackStack');
