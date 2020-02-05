/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/nem2SignTx';

import type { NEM2SignTxMessage, NEM2SignedTx, NEM2CosignatureSignedTx } from '../../types/trezor';
import type { Transaction as $NEM2Transaction } from '../../types/nem2';
import type { CoreMessage } from '../../types';

export default class NEM2SignTransaction extends AbstractMethod {
    message: NEM2SignTxMessage;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('NEM2'), this.firmwareRange);
        this.info = 'Sign NEM2 Transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'generationHash', obligatory: false },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        const generationHash = payload.generationHash;
        // incoming data should be in nem2-sdk format
        const transaction: $NEM2Transaction = payload.transaction;
        this.message = helper.createTx(transaction, path, generationHash);
    }

    async run(): Promise<NEM2SignedTx | NEM2CosignatureSignedTx> {
        return await this.device.getCommands().nem2SignTx(this.message);
    }
}
