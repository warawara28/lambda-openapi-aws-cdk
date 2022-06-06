import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as path from 'path';

interface LambdaStackProps extends StackProps {
  stackName: string
  projectName: string
  stage: string
  openApi: any
}

interface IntegrationSetting {
  readonly type: string
  readonly httpMethod: string
  readonly uri: string
  readonly payloadFormatVersion: string
}

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    const superProps = {
      ...props,
      stackName: undefined,
      projectName: undefined,
      stage: undefined,
      openApi: undefined,
    } as StackProps
    super(scope, id, superProps);

    const lambdaFunction = new lambda.Function(this, props.stackName, {
      functionName: props.stackName,
      runtime: lambda.Runtime.GO_1_X,
      architecture: lambda.Architecture.X86_64,
      handler: 'main',
      memorySize: 128, // MB
      environment: {},
      code: lambda.Code.fromAsset(path.join(__dirname, 'src/sample'))
    });

    const integrationSetting: IntegrationSetting = {
      type: 'AWS_PROXY',
      httpMethod: 'POST',
      uri: lambdaFunction.functionArn,
      payloadFormatVersion: '2.0'
    }

    // APIGatewayのOpenAPI独自拡張であるx-amazon-apigateway-integrationをここで追記
    Object.entries(props.openApi.paths).forEach(([path]) => {
      Object.entries(props.openApi.paths[path]).forEach(([method]) => {
        props.openApi.paths[path][method]['x-amazon-apigateway-integration'] = integrationSetting
      })
    })

    const apiName = `${props.projectName}-api`;
    const api = new apigatewayv2.CfnApi(this, apiName, {
      body: props.openApi
    })

    const stageName = `${apiName}-${props.stage}`
    const stage = new apigatewayv2.CfnStage(this, stageName, {
      apiId: api.ref,
      stageName: props.stage,
      autoDeploy: true,
    })

    lambdaFunction.addPermission(
      `${props.stackName}-permission`,
      {
        principal: new ServicePrincipal('apigateway.amazonaws.com'),
        action: 'lambda:InvokeFunction',
        sourceArn: `arn:aws:execute-api:${Stack.of(this).region}:${Stack.of(this).account}:${api.ref}/*/*/*`
      }
    )
    new CfnOutput(this, 'HTTP API Url', {
      value: api.attrApiEndpoint ?? 'Something went wrong with the deploy'
    })
  }
}
