#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda/lambda-stack';

const SwaggerParser = require('@apidevtools/swagger-parser')

async function createApp(): Promise<cdk.App> {
  const openApi: any = await SwaggerParser.dereference('./lib/lambda/src/sample/swagger.yaml')
  const app = new cdk.App();
  const projectName = "sample-cdk-openapi";

  const lambdaStackName = `${projectName}-lambda`;
  const lambdaStack = new LambdaStack(app, lambdaStackName, {
    stackName: lambdaStackName,
    projectName: projectName,
    stage: "v1",
    openApi: openApi,
  })
  return app;
}
createApp()
