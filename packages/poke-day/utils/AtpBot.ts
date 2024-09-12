

import { Agent, AppBskyFeedPost, CredentialSession } from '@atproto/api';

export class AtpBot {
    sessionHandler: CredentialSession
    agent: Agent
    constructor() {
        const serviceUrl = new URL('https://bsky.social')
        this.sessionHandler = new CredentialSession(serviceUrl)
        this.agent = new Agent(this.sessionHandler)
    }

    async login(identifier: string, password: string) {
        this.sessionHandler.login
        await this.sessionHandler.login({ identifier, password })
    }

    async post(record: Partial<AppBskyFeedPost.Record> &
        Omit<AppBskyFeedPost.Record, 'createdAt'>) {
        await this.agent.post(record)
    }

    public getAgent() {
        return this.agent
    }

    async uploadImage(imageUrl: string, encoding?: string) {
        const blob = await this.getImageBlob(imageUrl)
        const response = await this.agent.uploadBlob(blob, {encoding: encoding || 'image/png'})
        return response.data.blob
    }

    private async getImageBlob(imageUrl: string) {
        try {
        // Fetch the image from the URL
        const response = await fetch(imageUrl);
    
        // Check if the fetch was successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    
        // Convert the response into a Blob
        const blob = await response.blob();
        return blob;
        } catch (error) {
        console.error('Error fetching the image:', error);
        }
    }
}