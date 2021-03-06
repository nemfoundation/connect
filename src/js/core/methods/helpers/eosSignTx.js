/* @flow */
import * as bs58 from 'bs58';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    Transaction as $EosTransaction,
    EosTxAction as $EosTxAction,
    EosAuthorization as $EosAuthorization,
} from '../../../types/eos';

import type {
    EosAsset,
    EosTxActionRequest,
    EosSignedTx,
    EosSignTx,
    EosTxActionAck,
    EosTxHeader,
    EosActionCommon,
    EosAuthorization,
} from '../../../types/trezor';

// copied from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-numeric.ts
const binaryToDecimal = (bignum: Uint8Array | Array<number>, minDigits = 1) => {
    const result = Array(minDigits).fill('0'.charCodeAt(0));
    for (let i = bignum.length - 1; i >= 0; --i) {
        let carry = bignum[i];
        for (let j = 0; j < result.length; ++j) {
            const x = ((result[j] - '0'.charCodeAt(0)) << 8) + carry;
            result[j] = '0'.charCodeAt(0) + x % 10;
            carry = (x / 10) | 0;
        }
        while (carry) {
            result.push('0'.charCodeAt(0) + carry % 10);
            carry = (carry / 10) | 0;
        }
    }
    result.reverse();
    return String.fromCharCode(...result);
};

// copied from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts
// "pushName"
const serialize = (s?: string) => {
    if (typeof s !== 'string') {
        throw new Error(`Eos serialization error, "${typeof s}" should be a string`);
    }
    function charToSymbol(c: number) {
        if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
            return (c - 'a'.charCodeAt(0)) + 6;
        }
        if (c >= '1'.charCodeAt(0) && c <= '5'.charCodeAt(0)) {
            return (c - '1'.charCodeAt(0)) + 1;
        }
        return 0;
    }

    const a = new Uint8Array(8);
    let bit = 63;
    for (let i = 0; i < s.length; ++i) {
        let c = charToSymbol(s.charCodeAt(i));
        if (bit < 5) {
            c = c << 1;
        }
        for (let j = 4; j >= 0; --j) {
            if (bit >= 0) {
                a[Math.floor(bit / 8)] |= ((c >> j) & 1) << (bit % 8);
                --bit;
            }
        }
    }
    return binaryToDecimal(a);
};

// copied (and slightly modified) from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts
// "pushAsset"
const parseQuantity = (s: string): EosAsset => {
    if (typeof s !== 'string') {
        throw new Error(`Eos serialization error. Expected string containing asset, got: ${typeof s}`);
    }
    s = s.trim();
    let pos = 0;
    let amount = '';
    let precision = 0;
    if (s[pos] === '-') {
        amount += '-';
        ++pos;
    }
    let foundDigit = false;
    while (pos < s.length && s.charCodeAt(pos) >= '0'.charCodeAt(0) && s.charCodeAt(pos) <= '9'.charCodeAt(0)) {
        foundDigit = true;
        amount += s[pos];
        ++pos;
    }
    if (!foundDigit) {
        throw new Error('Eos serialization error. Asset must begin with a number');
    }
    if (s[pos] === '.') {
        ++pos;
        while (pos < s.length && s.charCodeAt(pos) >= '0'.charCodeAt(0) && s.charCodeAt(pos) <= '9'.charCodeAt(0)) {
            amount += s[pos];
            ++precision;
            ++pos;
        }
    }
    const symbol = s.substr(pos).trim();

    const a = [precision & 0xff];
    for (let i = 0; i < symbol.length; ++i) {
        a.push(symbol.charCodeAt(i));
    }
    while (a.length < 8) {
        a.push(0);
    }

    return {
        amount,
        symbol: binaryToDecimal(a.slice(0, 8)),
    };
};

// transform incoming parameters to protobuf messages format

const parseAuth = (a: $EosAuthorization): EosAuthorization => {
    function keyToBuffer(pk: string) {
        const len = pk.indexOf('EOS') === 0 ? 3 : 7;
        const key = bs58.decode(pk.substring(len));
        // key.slice(0, key.length - 4);

        return {
            type: 0,
            key: key.slice(0, key.length - 4),
        };
    }
    return {
        threshold: a.threshold,
        keys: a.keys.map(k => {
            return {
                weight: k.weight,
                ...keyToBuffer(k.key),
            };
        }),
        accounts: a.accounts.map(acc => {
            return {
                weight: acc.weight,
                account: {
                    actor: serialize(acc.permission.actor),
                    permission: serialize(acc.permission.permission),
                },
            };
        }),
        waits: a.waits,
    };
};

// from: https://github.com/EOSIO/eosjs/blob/master/src/eosjs-serialize.ts
// "dateToTimePoint"
const parseDate = (d: string): number => {
    if (typeof d !== 'string') {
        throw new Error('Eos serialization error. Header.expiration should be string or number');
    }
    if (d.substr(d.length - 1, d.length) !== 'Z') {
        d += 'Z';
    }
    return Date.parse(d) / 1000;
};

const parseAck = (action: $EosTxAction): EosTxActionAck | null => {
    switch (action.name) {
        case 'transfer':
            return {
                'transfer': {
                    sender: serialize(action.data.from),
                    receiver: serialize(action.data.to),
                    quantity: parseQuantity(action.data.quantity),
                    memo: action.data.memo,
                },
            };
        case 'delegatebw':
            return {
                'delegate': {
                    sender: serialize(action.data.from),
                    receiver: serialize(action.data.receiver),
                    net_quantity: parseQuantity(action.data.stake_net_quantity),
                    cpu_quantity: parseQuantity(action.data.stake_cpu_quantity),
                    transfer: action.data.transfer,
                },
            };
        case 'undelegatebw':
            return {
                'undelegate': {
                    sender: serialize(action.data.from),
                    receiver: serialize(action.data.receiver),
                    net_quantity: parseQuantity(action.data.unstake_net_quantity),
                    cpu_quantity: parseQuantity(action.data.unstake_cpu_quantity),
                },
            };
        case 'buyram':
            return {
                'buy_ram': {
                    payer: serialize(action.data.payer),
                    receiver: serialize(action.data.receiver),
                    quantity: parseQuantity(action.data.quant),
                },
            };
        case 'buyrambytes':
            return {
                'buy_ram_bytes': {
                    payer: serialize(action.data.payer),
                    receiver: serialize(action.data.receiver),
                    bytes: action.data.bytes,
                },
            };
        case 'sellram':
            return {
                'sell_ram': {
                    account: serialize(action.data.account),
                    bytes: action.data.bytes,
                },
            };
        case 'voteproducer':
            return {
                'vote_producer': {
                    voter: serialize(action.data.voter),
                    proxy: serialize(action.data.proxy),
                    producers: action.data.producers.map(p => serialize(p)),
                },
            };
        case 'refund':
            return {
                'refund': {
                    owner: serialize(action.data.owner),
                },
            };
        case 'updateauth':
            return {
                'update_auth': {
                    account: serialize(action.data.account),
                    permission: serialize(action.data.permission),
                    parent: serialize(action.data.parent),
                    auth: parseAuth(action.data.auth),
                },
            };
        case 'deleteauth':
            return {
                'delete_auth': {
                    account: serialize(action.data.account),
                    permission: serialize(action.data.permission),
                },
            };
        case 'linkauth':
            return {
                'link_auth': {
                    account: serialize(action.data.account),
                    code: serialize(action.data.code),
                    type: serialize(action.data.type),
                    requirement: serialize(action.data.requirement),
                },
            };
        case 'unlinkauth':
            return {
                'unlink_auth': {
                    account: serialize(action.data.account),
                    code: serialize(action.data.code),
                    type: serialize(action.data.type),
                },
            };
        case 'newaccount':
            return {
                'new_account': {
                    creator: serialize(action.data.creator),
                    name: serialize(action.data.name),
                    owner: parseAuth(action.data.owner),
                    active: parseAuth(action.data.active),
                },
            };
        default:
            return null;
    }
};

const parseUnknown = (action: $EosTxAction): EosTxActionAck | null => {
    if (typeof action.data !== 'string') return null;
    return {
        unknown: {
            data_size: action.data.length / 2,
            data_chunk: action.data,
        },
    };
};

const parseCommon = (action: $EosTxAction): EosActionCommon => {
    return {
        account: serialize(action.account),
        name: serialize(action.name),
        authorization: action.authorization.map(a => ({
            actor: serialize(a.actor),
            permission: serialize(a.permission),
        })),
    };
};

const parseAction = (action: $EosTxAction): EosTxActionAck => {
    const ack = parseAck(action) || parseUnknown(action);
    return {
        common: parseCommon(action),
        ...ack,
    };
};

export const validate = (address_n: Array<number>, tx: $EosTransaction) => {
    const header: ?EosTxHeader = tx.header ? {
        expiration: typeof tx.header.expiration === 'number' ? tx.header.expiration : parseDate(tx.header.expiration),
        ref_block_num: tx.header.refBlockNum,
        ref_block_prefix: tx.header.refBlockPrefix,
        max_net_usage_words: tx.header.maxNetUsageWords,
        max_cpu_usage_ms: tx.header.maxCpuUsageMs,
        delay_sec: tx.header.delaySec,
    } : null;

    const ack: Array<EosTxActionAck> = [];
    tx.actions.forEach(action => {
        ack.push(parseAction(action));
    });

    return {
        chain_id: tx.chainId,
        header,
        ack,
    };
};

// sign transaction logic

const CHUNK_SIZE = 2048;
const getDataChunk = (data: string, offset: number) => {
    if (offset < 0) return null;
    if (data.length < offset) return null;
    const o = offset > 0 ? data.length - offset * 2 : 0;
    return data.substring(o, o + CHUNK_SIZE * 2);
};

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    response: MessageResponse<EosTxActionRequest>,
    actions: Array<EosTxActionAck>,
    index: number,
): Promise<EosSignedTx> => {
    const action = actions[index];
    const lastOp = (index + 1 >= actions.length);
    let ack: MessageResponse<EosTxActionRequest>;
    const requestedDataSize = response.message.data_size;

    if (action.unknown) {
        const unknown = action.unknown;
        const offset = typeof requestedDataSize === 'number' ? requestedDataSize : 0;
        const data_chunk = getDataChunk(unknown.data_chunk, offset);
        const act = {
            common: action.common,
            unknown: {
                data_size: unknown.data_size,
                data_chunk,
            },
        };
        const sent = offset > 0 ? unknown.data_size - offset + CHUNK_SIZE : CHUNK_SIZE;
        const lastChunk = sent >= unknown.data_size;

        if (lastOp && lastChunk) {
            const response: MessageResponse<EosSignedTx> = await typedCall('EosTxActionAck', 'EosSignedTx', act);
            return response.message;
        } else {
            ack = await typedCall('EosTxActionAck', 'EosTxActionRequest', act);
            if (lastChunk) {
                index++;
            }
        }
    } else {
        if (lastOp) {
            const response: MessageResponse<EosSignedTx> = await typedCall('EosTxActionAck', 'EosSignedTx', action);
            return response.message;
        }
        ack = await typedCall('EosTxActionAck', 'EosTxActionRequest', action);
        index++;
    }

    return await processTxRequest(
        typedCall,
        ack,
        actions,
        index
    );
};

export const signTx = async (typedCall: (type: string, resType: string, msg: EosSignTx) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    chain_id: string,
    header: ?EosTxHeader,
    actions: Array<EosTxActionAck>,
): Promise<EosSignedTx> => {
    const response = await typedCall('EosSignTx', 'EosTxActionRequest', {
        address_n,
        chain_id,
        header,
        num_actions: actions.length,
    });
    return await processTxRequest(typedCall, response, actions, 0);
};
