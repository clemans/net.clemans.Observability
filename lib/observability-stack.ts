import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Alarm, ComparisonOperator, Metric, Stats, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';

export interface ObservabilityStackProps extends StackProps {
  alertEmail: string;
  threshold: number;
}

export class ObservabilityStack extends Stack {
  constructor(scope: Construct, id: string, props: ObservabilityStackProps) {
    super(scope, id, props);

    const billingTopic = new Topic(this, 'BillingAlertTopic', {
      displayName: 'Billing Alert Notifications',
    });

    const billingEmailSubscription = new EmailSubscription(props.alertEmail);
    billingTopic.addSubscription(billingEmailSubscription);

    const billingMetric = new Metric({
      metricName: 'EstimatedCharges',
      namespace: 'AWS/Billing',
      period: Duration.hours(6),
      statistic: Stats.MAXIMUM,
      dimensionsMap: { Currency: 'USD' }
    });

    const billingAlarm = new Alarm(this, 'BillingAlarm', {
      alarmName: 'EstimatedChargesAlarm',
      alarmDescription: `Alarm triggers when the estimated charges exceed $${props.threshold} USD.`,
      metric: billingMetric,
      threshold: props.threshold as number,
      datapointsToAlarm: 1,
      evaluationPeriods: 1,
      treatMissingData: TreatMissingData.MISSING,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD
    });
    billingAlarm.addAlarmAction({
      bind: () => ({ alarmActionArn: billingTopic.topicArn })
    });
  }
}
