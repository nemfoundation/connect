/* @flow */
'use strict';

import { validateParams } from './paramsValidator';
import { invalidParameter } from '../../../constants/errors';

import type {
    NEM2SignTxMessage,
    NEM2TransactionCommon,
    NEM2EmbeddedTransactionCommon,
    NEM2Transfer,
    NEM2MosaicDefinition,
    NEM2MosaicSupply,
    NEM2NamespaceRegistration,
    NEM2AddressAlias,
    NEM2MosaicAlias,
    NEM2NamespaceMetadata,
    NEM2MosaicMetadata,
    NEM2AccountMetadata,
    NEM2SecretLock,
    NEM2SecretProof,
    NEM2HashLock,
    NEM2Aggregate,
    NEM2InnerTransaction,
    NEM2MultisigModification,
    NEM2AccountAddressRestrictionTransaction,
    NEM2AccountMosaicRestrictionTransaction,
    NEM2AccountOperationRestrictionTransaction,
    NEM2AccountLinkTransaction,
    NEM2MosaicGlobalRestrictionTransaction,
    NEM2MosaicAddressRestrictionTransaction,
} from '../../../types/trezor';

import type {
    Transaction as $NEM2Transaction,
    Mosaic as $NEM2Mosaic,
    AccountAddressRestrictionTransaction,
    AccountMosaicRestrictionTransaction,
    AccountOperationRestrictionTransaction,
} from '../../../types/nem2';

export const NEM2_MAINNET: number = 0x68;
export const NEM2_TESTNET: number = 0x98;
export const NEM2_MIJIN: number = 0x60;

export const NETWORKS = {
    'mainnet': NEM2_MAINNET,
    'testnet': NEM2_TESTNET,
    'mijin': NEM2_MIJIN,
};

export const NEM2_TRANSFER: number = 0x4154;
export const NEM2_MOSAIC_DEFINITION: number = 0x414D;
export const NEM2_MOSAIC_SUPPLY: number = 0x424D;
export const NEM2_NAMESPACE_REGISTRATION: number = 0x414E;
export const NEM2_ADDRESS_ALIAS: number = 0x424E;
export const NEM2_MOSAIC_ALIAS: number = 0x434E;
export const NEM2_NAMESPACE_METADATA: number = 0x4344;
export const NEM2_MOSAIC_METADATA: number = 0x4244;
export const NEM2_ACCOUNT_METADATA: number = 0x4144;
export const NEM2_SECRET_LOCK: number = 0x4152;
export const NEM2_SECRET_PROOF: number = 0x4252;
export const NEM2_HASH_LOCK: number = 0x4148;
export const NEM2_AGGREGATE_COMPLETE: number = 0x4141;
export const NEM2_AGGREGATE_BONDED: number = 0x4241;
export const NEM2_MULTISIG_MODIFICATION: number = 0x4155;
export const NEM2_ACCOUNT_ADDRESS_RESTRICTION: number = 0x4150;
export const NEM2_ACCOUNT_MOSAIC_RESTRICTION: number = 0x4250;
export const NEM2_ACCOUNT_OPERATION_RESTRICTION: number = 0x4350;
export const NEM2_TRANSACTION_TYPE_ACCOUNT_LINK: number = 0x414C;
export const NEM2_TRANSACTION_TYPE_MOSAIC_GLOBAL_RESTRICTION: number = 0x4151;
export const NEM2_TRANSACTION_TYPE_MOSAIC_ADDRESS_RESTRICTION: number = 0x4251;

export const TX_TYPES = {
    'transfer': NEM2_TRANSFER,
    'mosaicSupply': NEM2_MOSAIC_SUPPLY,
    'namespaceRegistration': NEM2_NAMESPACE_REGISTRATION,
    'addressAlias': NEM2_ADDRESS_ALIAS,
    'mosaicAlias': NEM2_MOSAIC_ALIAS,
    'namespaceMetadata': NEM2_NAMESPACE_METADATA,
    'mosaicMetadata': NEM2_MOSAIC_METADATA,
    'accountMetadata': NEM2_ACCOUNT_METADATA,
    'secretLock': NEM2_SECRET_LOCK,
    'secretProof': NEM2_SECRET_PROOF,
    'hashLock': NEM2_HASH_LOCK,
    'aggregateComplete': NEM2_AGGREGATE_COMPLETE,
    'aggregateBonded': NEM2_AGGREGATE_BONDED,
    'multisigModification': NEM2_MULTISIG_MODIFICATION,
    'accountAddressRestriction': NEM2_ACCOUNT_ADDRESS_RESTRICTION,
    'accountMosaicRestriction': NEM2_ACCOUNT_MOSAIC_RESTRICTION,
    'accountOperationRestriction': NEM2_ACCOUNT_OPERATION_RESTRICTION,
    'accountLink': NEM2_TRANSACTION_TYPE_ACCOUNT_LINK,
    'mosaicGlobalRestriction': NEM2_TRANSACTION_TYPE_MOSAIC_GLOBAL_RESTRICTION,
    'mosaicAddressRestriction': NEM2_TRANSACTION_TYPE_MOSAIC_ADDRESS_RESTRICTION,
};

const getCommon = (tx: $NEM2Transaction): NEM2TransactionCommon => {
    validateParams(tx, [
        { name: 'type', type: 'number', obligatory: true },
        { name: 'network', type: 'number', obligatory: true },
        { name: 'version', type: 'number', obligatory: true },
        { name: 'maxFee', type: 'string', obligatory: true },
        { name: 'deadline', type: 'string', obligatory: true },
    ]);
    return {
        type: tx.type,
        network_type: tx.network,
        version: tx.version,
        max_fee: tx.maxFee,
        deadline: tx.deadline,
    };
};

function readUint32At(bytes, index) {
    return (bytes[index] + (bytes[index + 1] << 8) + (bytes[index + 2] << 16) + (bytes[index + 3] << 24)) >>> 0;
}

const getEmbeddedCommon = (tx: $NEM2Transaction): NEM2EmbeddedTransactionCommon => {
    validateParams(tx, [
        { name: 'type', type: 'number', obligatory: true },
        { name: 'network', type: 'number', obligatory: true },
        { name: 'version', type: 'number', obligatory: true },
        { name: 'signerPublicKey', type: 'string', obligatory: true },
    ]);
    return {
        type: tx.type,
        network_type: tx.network,
        version: tx.version,
        public_key: tx.signerPublicKey,
    };
};

const transferMessage = (tx: $NEM2Transaction): NEM2Transfer => {
    validateParams(tx, [
        { name: 'mosaics', type: 'array', obligatory: true },
        { name: 'message', type: 'object', obligatory: true },
        { name: 'recipientAddress', type: 'object', obligatory: true },
    ]);

    validateParams(tx.message, [
        { name: 'payload', type: 'string', obligatory: true },
        { name: 'type', type: 'number', obligatory: true },
    ]);

    validateParams(tx.recipientAddress, [
        { name: 'address', type: 'string', obligatory: true },
        { name: 'networkType', type: 'number', obligatory: true },
    ]);

    const mosaics: Array<$NEM2Mosaic> = tx.mosaics.map((mosaic: $NEM2Mosaic) => {
        validateParams(mosaic, [
            { name: 'id', type: 'string', obligatory: true },
            { name: 'amount', type: 'string', obligatory: true },
        ]);
        return {
            id: mosaic.id,
            amount: mosaic.amount,
        };
    });

    return {
        recipient_address: {
            address: tx.recipientAddress.address,
            network_type: tx.recipientAddress.networkType,
        },
        message: tx.message,
        mosaics,
    };
};

const mosaicDefinitionMessage = (tx: $NEM2Transaction): NEM2MosaicDefinition => {
    validateParams(tx, [
        { name: 'id', type: 'string', obligatory: true },
        { name: 'flags', type: 'number', obligatory: true },
        { name: 'divisibility', type: 'number', obligatory: true },
        { name: 'duration', type: 'string', obligatory: true },
    ]);

    let nonce = null;
    // Validate nonce manually
    if (typeof tx.nonce === 'number') {
        nonce = tx.nonce;
    } else if (typeof tx.nonce === 'object' && typeof tx.nonce.nonce === 'object') {
        nonce = readUint32At(tx.nonce.nonce, 0);
    } else {
        throw invalidParameter('Parameter nonce has invalid type.');
    }

    return {
        nonce: nonce,
        mosaic_id: tx.id,
        flags: tx.flags,
        divisibility: tx.divisibility,
        duration: tx.duration,
    };
};

const mosaicSupplyMessage = (tx: $NEM2Transaction): NEM2MosaicSupply => {
    validateParams(tx, [
        { name: 'mosaicId', type: 'string', obligatory: true },
        { name: 'action', type: 'number', obligatory: true },
        { name: 'delta', type: 'string', obligatory: true },
    ]);
    return {
        mosaic_id: tx.mosaicId,
        action: tx.action,
        delta: tx.delta,
    };
};

const namespaceRegistrationMessage = (tx: $NEM2Transaction): NEM2NamespaceRegistration => {
    validateParams(tx, [
        { name: 'namespaceName', type: 'string', obligatory: true },
        { name: 'registrationType', type: 'number', obligatory: true },
        { name: 'id', type: 'string', obligatory: true },
    ]);

    // fields common to both namespace registration types
    const fields = {
        registration_type: tx.registrationType,
        namespace_name: tx.namespaceName,
        id: tx.id,
    };

    // root namespace registration
    if (tx.registrationType === 0) {
        validateParams(tx, [{ name: 'duration', type: 'string', obligatory: true }]);
        return {
            ...fields,
            duration: tx.duration,
        };
    }

    // subnamespace
    if (tx.registrationType === 1) {
        validateParams(tx, [{ name: 'parentId', type: 'string', obligatory: true }]);
        return {
            ...fields,
            parent_id: tx.parentId,
        };
    }

    throw invalidParameter('Invalid Registration Type');
};

const addressAliasMessage = (tx: $NEM2Transaction): NEM2AddressAlias => {
    validateParams(tx, [
        { name: 'namespaceId', type: 'string', obligatory: true },
        { name: 'aliasAction', type: 'number', obligatory: true },
        { name: 'address', type: 'object', obligatory: true },
    ]);

    if (tx.aliasAction !== 0 && tx.aliasAction !== 1) {
        throw invalidParameter('Invalid Alias Action');
    }

    return {
        namespace_id: tx.namespaceId,
        alias_action: tx.aliasAction,
        address: {
            address: tx.address.address,
            network_type: tx.address.networkType,
        },
    };
};

const mosaicAliasMessage = (tx: $NEM2Transaction): NEM2MosaicAlias => {
    validateParams(tx, [
        { name: 'namespaceId', type: 'string', obligatory: true },
        { name: 'mosaicId', type: 'string', obligatory: true },
        { name: 'aliasAction', type: 'number', obligatory: true },
    ]);

    if (tx.aliasAction !== 0 && tx.aliasAction !== 1) {
        throw invalidParameter('Invalid Alias Action');
    }

    return {
        namespace_id: tx.namespaceId,
        mosaic_id: tx.mosaicId,
        alias_action: tx.aliasAction,
    };
};

const namespaceMetadataMessage = (tx: $NEM2Transaction): NEM2NamespaceMetadata => {
    validateParams(tx, [
        { name: 'targetPublicKey', type: 'string', obligatory: true },
        { name: 'scopedMetadataKey', type: 'string', obligatory: true },
        { name: 'targetNamespaceId', type: 'string', obligatory: true },
        { name: 'valueSizeDelta', type: 'number', obligatory: true },
        { name: 'valueSize', type: 'number', obligatory: true },
        { name: 'value', type: 'string', obligatory: true },
    ]);

    if (tx.valueSize > 1024) {
        throw invalidParameter('Invalid value size, value size cannot be greater than 1024');
    }

    return {
        target_public_key: tx.targetPublicKey,
        scoped_metadata_key: tx.scopedMetadataKey,
        target_namespace_id: tx.targetNamespaceId,
        value_size_delta: tx.valueSizeDelta,
        value_size: tx.valueSize,
        value: tx.value,
    };
};

const mosaicMetadataMessage = (tx: $NEM2Transaction): NEM2MosaicMetadata => {
    validateParams(tx, [
        { name: 'targetPublicKey', type: 'string', obligatory: true },
        { name: 'scopedMetadataKey', type: 'string', obligatory: true },
        { name: 'targetMosaicId', type: 'string', obligatory: true },
        { name: 'valueSizeDelta', type: 'number', obligatory: true },
        { name: 'valueSize', type: 'number', obligatory: true },
        { name: 'value', type: 'string', obligatory: true },
    ]);

    if (tx.valueSize > 1024) {
        throw invalidParameter('Invalid value size, value size cannot be greater than 1024');
    }

    return {
        target_public_key: tx.targetPublicKey,
        scoped_metadata_key: tx.scopedMetadataKey,
        target_mosaic_id: tx.targetMosaicId,
        value_size_delta: tx.valueSizeDelta,
        value_size: tx.valueSize,
        value: tx.value,
    };
};

const accountMetadataMessage = (tx: $NEM2Transaction): NEM2AccountMetadata => {
    validateParams(tx, [
        { name: 'targetPublicKey', type: 'string', obligatory: true },
        { name: 'scopedMetadataKey', type: 'string', obligatory: true },
        { name: 'valueSizeDelta', type: 'number', obligatory: true },
        { name: 'valueSize', type: 'number', obligatory: true },
        { name: 'value', type: 'string', obligatory: true },
    ]);

    if (tx.valueSize > 1024) {
        throw invalidParameter('Invalid value size, value size cannot be greater than 1024');
    }

    return {
        target_public_key: tx.targetPublicKey,
        scoped_metadata_key: tx.scopedMetadataKey,
        value_size_delta: tx.valueSizeDelta,
        value_size: tx.valueSize,
        value: tx.value,
    };
};

const secretLockMessage = (tx: $NEM2Transaction): NEM2SecretLock => {
    validateParams(tx, [
        { name: 'mosaicId', type: 'string', obligatory: true },
        { name: 'amount', type: 'string', obligatory: true },
        { name: 'duration', type: 'string', obligatory: true },
        { name: 'hashAlgorithm', type: 'number', obligatory: true },
        { name: 'secret', type: 'string', obligatory: true },
        { name: 'recipientAddress', type: 'object', obligatory: true },
    ]);

    validateParams(tx.recipientAddress, [
        { name: 'address', type: 'string', obligatory: true },
        { name: 'networkType', type: 'number', obligatory: true },
    ]);

    if (tx.hashAlgorithm !== 0 &&
        tx.hashAlgorithm !== 1 &&
        tx.hashAlgorithm !== 2 &&
        tx.hashAlgorithm !== 3) {
        throw invalidParameter('Invalid Hash Algorithm');
    }

    return {
        mosaic: {
            id: tx.mosaicId,
            amount: tx.amount,
        },
        duration: tx.duration,
        hash_algorithm: tx.hashAlgorithm,
        secret: tx.secret,
        recipient_address: {
            address: tx.recipientAddress.address,
            network_type: tx.recipientAddress.networkType,
        },
    };
};

const secretProofMessage = (tx: $NEM2Transaction): NEM2SecretProof => {
    validateParams(tx, [
        { name: 'hashAlgorithm', type: 'number', obligatory: true },
        { name: 'secret', type: 'string', obligatory: true },
        { name: 'proof', type: 'string', obligatory: true },
    ]);

    validateParams(tx.recipientAddress, [
        { name: 'address', type: 'string', obligatory: true },
        { name: 'networkType', type: 'number', obligatory: true },
    ]);

    if (tx.hashAlgorithm !== 0 &&
        tx.hashAlgorithm !== 1 &&
        tx.hashAlgorithm !== 2 &&
        tx.hashAlgorithm !== 3) {
        throw invalidParameter('Invalid Hash Algorithm');
    }

    return {
        hash_algorithm: tx.hashAlgorithm,
        secret: tx.secret,
        proof: tx.proof,
        recipient_address: {
            address: tx.recipientAddress.address,
            network_type: tx.recipientAddress.networkType,
        },
    };
};

const hashLockMessage = (tx: $NEM2Transaction): NEM2HashLock => {
    validateParams(tx, [
        { name: 'mosaicId', type: 'object', obligatory: true },
        { name: 'amount', type: 'string', obligatory: true },
        { name: 'duration', type: 'string', obligatory: true },
        { name: 'hash', type: 'string', obligatory: true },
    ]);

    return {
        mosaic: {
            id: tx.mosaicId,
            amount: tx.amount,
        },
        duration: tx.duration,
        hash: tx.hash,
    };
};

const multisigModificationMessage = (tx: $NEM2Transaction): NEM2MultisigModification => {
    return {
        min_approval_delta: tx.minApprovalDelta || 0,
        min_removal_delta: tx.minRemovalDelta || 0,
        public_key_additions: tx.publicKeyAdditions || [],
        public_key_deletions: tx.publicKeyDeletions || [],
    };
};

const accountAddressRestrictionMessage = (tx: AccountAddressRestrictionTransaction): NEM2AccountAddressRestrictionTransaction => {
    return {
        restriction_type: tx.restrictionType,
        restriction_additions: tx.restrictionAdditions.map((addition) => {
            return {
                address: addition.address,
                network_type: addition.networkType,
            };
        }),
        restriction_deletions: tx.restrictionDeletions.map((addition) => {
            return {
                address: addition.address,
                network_type: addition.networkType,
            };
        }),
    };
};

const accountMosaicRestrictionMessage = (tx: AccountMosaicRestrictionTransaction): NEM2AccountMosaicRestrictionTransaction => {
    return {
        restriction_type: tx.restrictionType,
        restriction_additions: tx.restrictionAdditions,
        restriction_deletions: tx.restrictionDeletions,
    };
};

const accountOperationRestrictionMessage = (tx: AccountOperationRestrictionTransaction): NEM2AccountOperationRestrictionTransaction => {
    return {
        restriction_type: tx.restrictionType,
        restriction_additions: tx.restrictionAdditions,
        restriction_deletions: tx.restrictionDeletions,
    };
};

const hashAggregate = (tx: $NEM2Transaction): NEM2Aggregate => {
    validateParams(tx, [
        { name: 'transactions', type: 'array', obligatory: true },
        { name: 'cosignatures', type: 'array', obligatory: false, allowEmpty: true },
    ]);
    const inner_transactions = tx.transactions.map(({ transaction }) => {
        const inner_transaction: NEM2InnerTransaction = {
            common: getEmbeddedCommon(transaction),
            // may be recursive
            // eslint-disable-next-line no-use-before-define
            ...getTransactionBody(transaction),
        };

        return inner_transaction;
    });

    let cosignatures = [];
    if ('cosignatures' in tx) {
        cosignatures = tx.cosignatures.map(cosignature => ({
            signature: cosignature.signature,
            public_key: cosignature.publicKey,
        }));
    }

    return {
        inner_transactions,
        cosignatures,
    };
};

const accountLink = (tx: $NEM2Transaction): NEM2AccountLinkTransaction => {
    validateParams(tx, [
        { name: 'remotePublicKey', type: 'string', obligatory: true },
        { name: 'linkAction', type: 'number', obligatory: true },
    ]);
    return {
        remote_public_key: tx.remotePublicKey,
        link_action: tx.linkAction,
    };
};

const mosaicGlobalRestriction = (tx: $NEM2Transaction): NEM2MosaicGlobalRestrictionTransaction => {
    validateParams(tx, [
        { name: 'mosaicId', type: 'string', obligatory: true },
        { name: 'referenceMosaicId', type: 'string', obligatory: false },
        { name: 'restrictionKey', type: 'string', obligatory: true },
        { name: 'previousRestrictionValue', type: 'string', obligatory: true },
        { name: 'newRestrictionValue', type: 'string', obligatory: true },
        { name: 'previousRestrictionType', type: 'number', obligatory: true },
        { name: 'newRestrictionType', type: 'number', obligatory: true },
    ]);
    return {
        mosaic_id: tx.mosaicId,
        reference_mosaic_id: tx.referenceMosaicId,
        restriction_key: tx.restrictionKey,
        previous_restriction_value: tx.previousRestrictionValue,
        new_restriction_value: tx.newRestrictionValue,
        previous_restriction_type: tx.previousRestrictionType,
        new_restriction_type: tx.newRestrictionType,
    };
};

const mosaicAddressRestriction = (tx: $NEM2Transaction): NEM2MosaicAddressRestrictionTransaction => {
    validateParams(tx, [
        { name: 'mosaicId', type: 'string', obligatory: true },
        { name: 'restrictionKey', type: 'string', obligatory: true },
        { name: 'previousRestrictionValue', type: 'string', obligatory: false },
        { name: 'newRestrictionValue', type: 'string', obligatory: true },
        { name: 'targetAddress', type: 'object', obligatory: true },
    ]);

    validateParams(tx.targetAddress, [
        { name: 'address', type: 'string', obligatory: true },
        { name: 'networkType', type: 'number', obligatory: true },
    ]);

    return {
        mosaic_id: tx.mosaicId,
        restriction_key: tx.restrictionKey,
        previous_restriction_value: tx.previousRestrictionValue,
        new_restriction_value: tx.newRestrictionValue,
        target_address: {
            address: tx.targetAddress.address,
            network_type: tx.targetAddress.networkType,
        },
    };
};

const getTransactionBody = (transaction) => {
    const message = {};
    switch (transaction.type) {
        case NEM2_TRANSFER:
            message.transfer = transferMessage(transaction);
            break;
        case NEM2_MOSAIC_DEFINITION:
            message.mosaic_definition = mosaicDefinitionMessage(transaction);
            break;
        case NEM2_MOSAIC_SUPPLY:
            message.mosaic_supply = mosaicSupplyMessage(transaction);
            break;
        case NEM2_NAMESPACE_REGISTRATION:
            message.namespace_registration = namespaceRegistrationMessage(transaction);
            break;
        case NEM2_ADDRESS_ALIAS:
            message.address_alias = addressAliasMessage(transaction);
            break;
        case NEM2_MOSAIC_ALIAS:
            message.mosaic_alias = mosaicAliasMessage(transaction);
            break;
        case NEM2_NAMESPACE_METADATA:
            message.namespace_metadata = namespaceMetadataMessage(transaction);
            break;
        case NEM2_MOSAIC_METADATA:
            message.mosaic_metadata = mosaicMetadataMessage(transaction);
            break;
        case NEM2_ACCOUNT_METADATA:
            message.account_metadata = accountMetadataMessage(transaction);
            break;
        case NEM2_SECRET_LOCK:
            message.secret_lock = secretLockMessage(transaction);
            break;
        case NEM2_SECRET_PROOF:
            message.secret_proof = secretProofMessage(transaction);
            break;
        case NEM2_HASH_LOCK:
            message.hash_lock = hashLockMessage(transaction);
            break;
        case NEM2_AGGREGATE_COMPLETE:
            message.aggregate = hashAggregate(transaction);
            break;
        case NEM2_AGGREGATE_BONDED:
            message.aggregate = hashAggregate(transaction);
            break;
        case NEM2_MULTISIG_MODIFICATION:
            message.multisig_modification = multisigModificationMessage(transaction);
            break;
        case NEM2_ACCOUNT_ADDRESS_RESTRICTION:
            message.account_address_restriction = accountAddressRestrictionMessage(transaction);
            break;
        case NEM2_ACCOUNT_MOSAIC_RESTRICTION:
            message.account_mosaic_restriction = accountMosaicRestrictionMessage(transaction);
            break;
        case NEM2_ACCOUNT_OPERATION_RESTRICTION:
            message.account_operation_restriction = accountOperationRestrictionMessage(transaction);
            break;
        case NEM2_TRANSACTION_TYPE_ACCOUNT_LINK:
            message.account_link = accountLink(transaction);
            break;
        case NEM2_TRANSACTION_TYPE_MOSAIC_GLOBAL_RESTRICTION:
            message.mosaic_global_restriction = mosaicGlobalRestriction(transaction);
            break;
        case NEM2_TRANSACTION_TYPE_MOSAIC_ADDRESS_RESTRICTION:
            message.mosaic_address_restriction = mosaicAddressRestriction(transaction);
            break;
        default:
            throw new Error(`Unknown transaction type: ${transaction.type}`);
    }

    return message;
};

export const createTx = (tx: $NEM2Transaction, address_n: Array<number>, generation_hash: string): NEM2SignTxMessage => {
    const transaction: $NEM2Transaction = tx;

    if (transaction.cosigning) {
        const message: NEM2SignTxMessage = {
            address_n: address_n,
            cosigning: transaction.cosigning,
        };
        return message;
    }

    const message: NEM2SignTxMessage = {
        address_n: address_n,
        generation_hash: generation_hash,
        transaction: getCommon(tx),
        ...getTransactionBody(transaction),
    };

    return message;
};
