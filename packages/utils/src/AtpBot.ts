

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
}