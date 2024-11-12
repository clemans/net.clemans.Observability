import { Construct } from 'constructs';
import { App } from 'aws-cdk-lib';
import { ObservabilityStack, ObservabilityStackProps } from '../lib/observability-stack';
import { Properties } from '../config/properties';

const app: Construct = new App();
new ObservabilityStack(app, Properties.stackName as string, Properties as ObservabilityStackProps);