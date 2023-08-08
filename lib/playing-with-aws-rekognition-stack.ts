import { join } from 'path';
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class PlayingWithAwsRekognitionStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'Rekognition-Bucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const rekognitionLmb = new NodejsFunction(this, 'Rekognition-Lambda', {
      architecture: Architecture.ARM_64,
      entry: join(__dirname, 'lambda/rekogniition/index.ts'),
      handler: 'handler',
    });

    bucket.grantRead(rekognitionLmb);

    rekognitionLmb.addEventSource(new S3EventSource(bucket, {
      events: [EventType.OBJECT_CREATED]
    }));

    rekognitionLmb.role?.attachInlinePolicy(
      new Policy(this, 'rekognitionDetectText', {
        statements: [
          new PolicyStatement({
            actions: ['rekognition:DetectText'],
            resources: ['*']
          })
        ]
      })
    );
  }
}
