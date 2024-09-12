import { APIGatewayProxyResult } from 'aws-lambda';
type WebhookEvent = {
    body: string;
};
export declare const handler: (event: WebhookEvent) => Promise<APIGatewayProxyResult>;
export {};
