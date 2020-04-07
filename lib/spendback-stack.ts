import * as cdk from '@aws-cdk/core';
import { Authentication } from './authentication';


export class SpendBackStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authentication = new Authentication(this, 'Authentication');


    // The code that defines your stack goes here
  }
}

