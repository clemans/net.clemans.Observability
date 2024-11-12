import { Match, Template, Capture } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
import { ObservabilityStack } from '../lib/observability-stack';

const mockProps = {
  env: { account: '123456789012', region: 'us-east-1' },
  alertEmail: 'alerts@domain.com',
  threshold: 200
};

describe('ObservabilityStack', () => {
  let stack: Stack;
  beforeEach(() => {
    stack = new Stack();
  });

  test('SNS Topic Created for Billing Alerts', () => {
    const testStack = new ObservabilityStack(stack, 'MyObservabilityStack', mockProps);
    const template = Template.fromStack(testStack);
    template.resourceCountIs('AWS::SNS::Topic', 1);
    template.hasResourceProperties('AWS::SNS::Topic', {
      DisplayName: 'Billing Alert Notifications'
    });
  });

  test('SNS Email Subscription Created', () => {
    const testStack = new ObservabilityStack(stack, 'MyObservabilityStack', mockProps);
    const template = Template.fromStack(testStack);
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'alerts@domain.com'
    });
  });

  test('Billing Metric Created', () => {
    const testStack = new ObservabilityStack(stack, 'MyObservabilityStack', mockProps);
    const template = Template.fromStack(testStack);
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      Namespace: 'AWS/Billing',
      MetricName: 'EstimatedCharges',
      Period: 21600, // 6 hours in seconds
      Statistic: 'Maximum',
      Dimensions: [
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ]
    });
  });

  test('Billing Alarm Created with Correct Properties', () => {
    const testStack = new ObservabilityStack(stack, 'MyObservabilityStack', mockProps);
    const template = Template.fromStack(testStack);
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmName: 'EstimatedChargesAlarm',
      AlarmDescription: `Alarm triggers when the estimated charges exceed $200 USD.`,
      ComparisonOperator: 'GreaterThanOrEqualToThreshold',
      EvaluationPeriods: 1,
      Threshold: 200,
      TreatMissingData: 'missing'
    });

    // Check that the alarm action is properly configured with the SNS topic ARN
    const snsArnCapture = new Capture();
    template.hasResourceProperties('AWS::CloudWatch::Alarm', {
      AlarmActions: [snsArnCapture]
    });
    const matchResult = Match.objectLike({ Ref: Match.anyValue() }).test(snsArnCapture.asObject());
    expect(matchResult.isSuccess).toBe(true);
  });
});
