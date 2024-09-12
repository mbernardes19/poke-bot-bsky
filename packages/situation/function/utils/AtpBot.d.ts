import { Agent, AppBskyFeedPost, CredentialSession } from '@atproto/api';
export declare class AtpBot {
    sessionHandler: CredentialSession;
    agent: Agent;
    constructor();
    login(identifier: string, password: string): Promise<void>;
    post(record: Partial<AppBskyFeedPost.Record> & Omit<AppBskyFeedPost.Record, 'createdAt'>): Promise<void>;
    getAgent(): Agent;
    uploadImage(imageUrl: string, encoding?: string): Promise<import("@atproto/api").BlobRef>;
    private getImageBlob;
}
