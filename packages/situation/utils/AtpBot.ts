

import { Agent, CredentialSession } from '@atproto/api';
import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2'

export type PostData = {
    message: string,
    images?: {
        url: string
        alt?: string
        encoding?: string
    }[]
    originalMessage: FirehoseEvent
}

export type FirehoseEvent = {
    action: 'create'
    path: string
    cid: any
    record: {
        text: string
        $type: string
        langs: string[],
        reply?: {
            parent: {
                cid: string,
                uri: string
            },
            root: {
                cid: string,
                uri: string
            }
        },
        facets:
            {
                $type: string
                index: {
                    byteEnd: number,
                    byteStart: number
                }
                features: {
                    did: string
                    $type: string
                }[]
            }[],
        createdAt: string
    },
    uri: string
}

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

    async post(data: PostData) {
        const { message, images, originalMessage } = data
        const cidsToParse = [this.getCid(originalMessage.cid), this.getCid(originalMessage.record.reply?.root.cid)]

        const imagesToUpload = images?.map(image => this.uploadImage(image.url, image.encoding || 'image/png'))
        const imageAlts = images?.map(img => img.alt)
        
        const asyncActions = [...cidsToParse, ...(imagesToUpload || [])]
        const [parentCid, rootCid, ...uploadedImages] = await Promise.all(asyncActions)

        await this.agent.post({
            text: message,
            ...(images && ({
                embed: {
                    images: uploadedImages.map((imageBlob, idx) => ({
                        image: imageBlob,
                        alt: imageAlts ? imageAlts[idx] : '',
                    })),
                    '$type': 'app.bsky.embed.images'
                }
            })),
            reply: {
                parent: {
                    uri: originalMessage.uri,
                    cid: parentCid?.toString() || '',
                },
                root: {
                    uri: originalMessage.record.reply?.root.uri || originalMessage.uri,
                    cid: rootCid?.toString() || parentCid?.toString() || ''
                }
            }
        })
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

    private getCid = async (decodedCid?: any) => {
        if (!decodedCid)
            return undefined
        const bytes = json.encode(decodedCid)
        const hash = await sha256.digest(bytes)
        return CID.create(1, json.code, hash)
    }
    
}