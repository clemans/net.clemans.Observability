import 'dotenv/config';
import { version } from '../package.json';

export const BillingAlertConfig: { [key: string]: string | number } = {
  alertEmail: process.env.AWS_STAKEHOLDER_EMAIL as string,
  threshold: Number(process.env.AWS_THRESHOLD_AMOUNT) as number
};

export const Tags: { [key: string]: string } =  {
  version,
  environment: process.env.NODE_ENV as string,
  owner: process.env.AWS_STACK_OWNER as string,
  repo: process.env.REPO_NAME as string
};