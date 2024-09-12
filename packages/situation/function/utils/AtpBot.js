"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtpBot = void 0;
const api_1 = require("@atproto/api");
class AtpBot {
    constructor() {
        const serviceUrl = new URL('https://bsky.social');
        this.sessionHandler = new api_1.CredentialSession(serviceUrl);
        this.agent = new api_1.Agent(this.sessionHandler);
    }
    async login(identifier, password) {
        this.sessionHandler.login;
        await this.sessionHandler.login({ identifier, password });
    }
    async post(record) {
        await this.agent.post(record);
    }
    getAgent() {
        return this.agent;
    }
    async uploadImage(imageUrl, encoding) {
        const blob = await this.getImageBlob(imageUrl);
        const response = await this.agent.uploadBlob(blob, { encoding: encoding || 'image/png' });
        return response.data.blob;
    }
    async getImageBlob(imageUrl) {
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
        }
        catch (error) {
            console.error('Error fetching the image:', error);
        }
    }
}
exports.AtpBot = AtpBot;
