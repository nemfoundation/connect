/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type {
    NEM2EncryptMessage as _NEM2EncryptMessage,
    NEM2EncryptedMessage,
} from '../../types/trezor';
import type { $NEM2EncryptMessage } from '../../types/nem2';
import type { CoreMessage } from '../../types';

export default class NEM2EncryptMessage extends AbstractMethod {
    message: _NEM2EncryptMessage

    constructor(message: CoreMessage) {
        console.log('ENCRYPTMESSAGE CONSTRUCTOR');
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('NEM2'), this.firmwareRange);
        this.info = 'Encrypt NEM2 Message';

        const payload: Object = message.payload;
        const path = validatePath(payload.path, 3);
        // validate incoming parameters
        validateParams(payload, [
            { name: 'payload', obligatory: true },
            { name: 'recipientPublicKey', obligatory: false },
        ]);

        // incoming data should be in nem2-sdk format
        this.message = {
            address_n: path,
            recipient_public_key: payload.recipientPublicKey,
            payload: payload.payload,
        };
    }

    async run(): Promise<NEM2EncryptedMessage> {
        console.log('RUNNING ENCRYPTMESSAge');
        return await this.device.getCommands().nem2EncryptMessage(this.message);
    }
}
