/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';

import type {
    NEM2DecryptMessage as _NEM2DecryptMessage,
    NEM2DecryptedMessage,
} from '../../types/trezor';
import type { $NEM2DecryptMessage } from '../../types/nem2';
import type { CoreMessage } from '../../types';

export default class NEM2DecryptMessage extends AbstractMethod {
    message: _NEM2DecryptMessage

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('NEM2'), this.firmwareRange);
        this.info = 'Decrypt NEM2 Message';

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
            sender_public_key: payload.senderPublicKey,
            payload: payload.payload,
        };
    }

    async run(): Promise<NEM2DecryptedMessage> {
        return await this.device.getCommands().nem2DecryptMessage(this.message);
    }
}
