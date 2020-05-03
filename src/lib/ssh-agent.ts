import { find } from 'lodash'
import net from 'net'
import { base64Url } from '../util/base64-url'

const PROTOCOL = {
  SSH_AGENTC_REQUEST_RSA_IDENTITIES: 11,
  SSH_AGENT_IDENTITIES_ANSWER: 12,
  SSH2_AGENTC_SIGN_REQUEST: 13,
  SSH2_AGENT_SIGN_RESPONSE: 14,
}

const FLAG = {
  SSH_AGENT_RSA_SHA2_256: 2,
  SSH_AGENT_RSA_SHA2_512: 4,
}

/**
 * {@link https://tools.ietf.org/id/draft-miller-ssh-agent-01.html SSH Agent Protocol}
 */
export class SSHAgentClient {
  private readonly socketPath: string

  constructor(socketPath: string) {
    this.socketPath = socketPath
  }

  public async findKey(comment: string): Promise<any|undefined> {
    const keys = await this.fetchKeys()
    return find(keys, { comment })
  }

  public async generateJWT(payload: any, key: Buffer): Promise<string> {
    const header = { alg: 'RS256', typ: 'JWT' }
    const data = `${base64Url(header)}.${base64Url(payload)}`
    const signature = await this.signRequest(Buffer.from(data), key)

    return `${data}.${base64Url(signature.raw)}`
  }

  private fetchKeys() {
    const buildRequest = () => {
      const request = Buffer.alloc(4 + 1)
      this.writeRequestHeader(request, PROTOCOL.SSH_AGENTC_REQUEST_RSA_IDENTITIES)

      return request
    }

    const parseResponse = (data: Buffer) => {
      const numKeys = data.readUInt32BE(0)

      const keys = []
      let offset = 4
      for (let i = 0; i < numKeys; i++) {
        const key = this.readString(data, offset)
        offset += 4 + key.length

        const comment = this.readString(data, offset)
        offset += 4 + comment.length

        keys.push({
          key: key.toString('base64'),
          comment: comment.toString('utf8'),
          raw: key,
        })
      }

      return keys
    }

    return this.request(buildRequest, PROTOCOL.SSH_AGENT_IDENTITIES_ANSWER, parseResponse)
  }

  private signRequest(data: Buffer, key: Buffer): Promise<any> {
    const buildRequest = () => {
      const request = Buffer.alloc(4 + 1 + 4 + key.length + 4 + data.length + 4)
      let offset = this.writeRequestHeader(request, PROTOCOL.SSH2_AGENTC_SIGN_REQUEST)
      offset = this.writeString(request, key, offset)
      offset = this.writeString(request, data, offset)
      request.writeUInt32BE(FLAG.SSH_AGENT_RSA_SHA2_256, offset)

      return request
    }

    const parseResponse = (response: Buffer) => {
      const blob = this.readString(response, 0)
      const type = this.readString(blob, 0)
      const signature = this.readString(blob, 4 + type.length)

      return {
        type: type.toString('utf8'),
        signature: signature.toString('base64'),
        raw: signature,
      }
    }

    return this.request(buildRequest, PROTOCOL.SSH2_AGENT_SIGN_RESPONSE, parseResponse)
  }

  private readString(data: Buffer, offset: number) {
    const length = data.readUInt32BE(offset)
    offset += 4

    const str = Buffer.alloc(length)
    data.copy(str, 0, offset, offset + length)
    return str
  }

  private writeString(dest: Buffer, data: Buffer, offset: number): number {
    dest.writeUInt32BE(data.length, offset)
    offset += 4
    data.copy(dest, offset)

    return offset + data.length
  }

  private writeRequestHeader(request: Buffer, tag: number): number {
    request.writeUInt32BE(request.length - 4, 0)
    request.writeUInt8(tag, 4)

    return 5
  }

  private request(buildRequest: () => Buffer, responseTag: number, parseResponse: (response: Buffer) => any): Promise<any> {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(this.socketPath)

      socket.on('connect', () => {
        socket.write(buildRequest())
      })

      socket.on('data', (data) => {
        socket.end()

        const length = data.readUInt32BE(0)
        if (length !== data.length - 4) {
          throw new Error(`Expected length ${length}, but got ${data.length}`)
        }

        const tag = data.readUInt8(4)
        if (tag !== responseTag) {
          throw new Error(`Expected tag ${responseTag}, but got ${tag}`)
        }

        resolve(parseResponse(data.slice(5)))
      })

      socket.on('error', (error) => {
        reject(error)
      })
    })
  }
}
