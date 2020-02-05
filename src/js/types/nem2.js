/* @flow */
// NEM2 types from nem2-sdk
// https://nem2project.github.io/#transferTransaction

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type { NEM2SignedTx, NEM2CosignatureSignedTx } from './trezor';

type Message = {
    payload: string,
    type: number,
}

export type Mosaic = {
    id: string, // uint64
    amount: string, // uint64
}

export type NetworkType =
    104 // MAIN_NET
  | 152 // TEST_NET
  | 96 // MIJIN
  | 144 // MIJIN_TEST

export type TransactionType =
    0x4154 // Transfer
  | 0x414D // MosaicDefinition
  | 0x424D // MosaicSupplyChange
  | 0x414E // NamespaceRegistration
  | 0x424E // AddressAlias
  | 0x434E // MosaicAlias
  | 0x4344 // NamespaceMetadata
  | 0x4244 // MosaicMetadata
  | 0x4144 // AccountMetadata
  | 0x4152 // SecretLock
  | 0x4252 // SecretProof
  | 0x4148 // HashLock
  | 0x4141 // AggregateComplete
  | 0x4241 // AggregateBonded
  | 0x4155 // MultisigModification
  | 0x4150 // AccountAddressRestrictionTransaction
  | 0x4250 // AccountMosaicRestrictionTransaction
  | 0x4350 // AccountOperationRestrictionTransaction
  | 0x414C // AccountLink
  | 0x4151 // MosaicGlobalRestrictionTransaction
  | 0x4251 // MosaicAddressRestrictionTransaction

export type NEM2Address = {
    address: String,
    networkType: NetworkType,
}

export type TransactionBase = {
    type: TransactionType,
    network: NetworkType,
    version: number,
    maxFee: string, // uint64 (optional so the Transaction type can be reused as an inner transaction)
    deadline: string, // uint64 (optional so the Transaction type can be reused as an inner transaction)
    signer?: string,
    signature?: string,

    signerPublicKey: string, // used in inner transaction
}

export type Cosign = {
    cosigning: string,
}

export type Transfer = {
    recipientAddress: NEM2Address,
    mosaics: Array<Mosaic>,
    message: Message,
}

export type MosaicDefinition = {
    nonce: number,
    id: string,
    flags: number,
    divisibility: number,
    duration: string,
}

export type MosaicSupply = {
    mosaicId: string,
    action: number,
    delta: string,
}

export type NamespaceRegistration = {
    registrationType: number,
    namespaceName: string,
    id: string,
    parentId?: string,
    duration?: string,
}

export type AddressAlias = {
    namespaceId: string,
    address: NEM2Address,
    aliasAction: number,
}

export type MosaicAlias = {
    namespaceId: string,
    mosaicId: string,
    aliasAction: number,
}

export type NamespaceMetadata = {
    targetPublicKey: string,
    scopedMetadataKey: string,
    targetNamespaceId: string,
    valueSizeDelta: number,
    valueSize: number,
    value: string,
}

export type MosaicMetadata = {
    targetPublicKey: string,
    scopedMetadataKey: string,
    targetMosaicId: string,
    valueSizeDelta: number,
    valueSize: number,
    value: string,
}

export type AccountMetadata = {
    targetPublicKey: string,
    scopedMetadataKey: string,
    valueSizeDelta: number,
    valueSize: number,
    value: string,
}

export type SecretLock = {
    mosaicId: string,
    amount: string,
    duration: string,
    hashAlgorithm: number,
    secret: string,
    recipientAddress: NEM2Address,
}

export type SecretProof = {
    hashAlgorithm: number,
    secret: string,
    proof: string,
}

export type HashLock = {
    mosaicId: string,
    amount: string,
    duration: string,
    hash: string,
}

export type MultisigModification = {
    minApprovalDelta: number,
    minRemovalDelta: number,
    publicKeyAdditions: string[],
    publicKeyDeletions: string[],
}

// Define the AccountRestriction types seperately as they all need to share the same properties
// restrictionAdditions, restrictionDeletions which differ in types between the three transactions.
export type AccountAddressRestrictionTransaction = TransactionBase & {
    restrictionType: number,
    restrictionAdditions: NEM2Address[],
    restrictionDeletions: NEM2Address[],
    // targetAddress: NEM2Address,
}

export type AccountMosaicRestrictionTransaction = TransactionBase & {
    restrictionType: number,
    restrictionAdditions: string[],
    restrictionDeletions: string[],
}

export type AccountOperationRestrictionTransaction = TransactionBase & {
    restrictionType: number,
    restrictionAdditions: number[],
    restrictionDeletions: number[],
    // targetAddress: NEM2Address,
}

export type Cosignatures = {
    signature: string,
    publicKey: string,
}

export type Aggregate = {
    transactions: Array<Object>,
    cosignatures: Array<Cosignatures>,
}

export type AccountLinkTransaction = {
    remotePublicKey: string,
    linkAction: number,
}

export type MosaicGlobalRestrictionTransaction = {
    mosaicId: string,
    referenceMosaicId?: string,
    restrictionKey: string,
    previousRestrictionValue: string,
    newRestrictionValue: string,
    previousRestrictionType: string,
    newRestrictionType: string,
}

export type MosaicAddressRestrictionTransaction = {
    mosaicId: string,
    restrictionKey: string,
    previousRestrictionValue?: string,
    newRestrictionValue: string,
    targetAddress: NEM2Address,
}

export type $NEM2PublicKey = {
    path: $Path,
    publicKey: string,
    serializedPath: string,
}
export type NEM2GetPublicKeyResponse = {
    success: true,
    payload: $NEM2PublicKey | Array<$NEM2PublicKey>,
} | Unsuccessful$;

// sign transaction
export type Transaction = TransactionBase &
                            Transfer &
                            MosaicDefinition &
                            MosaicSupply &
                            NamespaceRegistration &
                            AddressAlias &
                            MosaicAlias &
                            NamespaceMetadata &
                            MosaicMetadata &
                            AccountMetadata &
                            SecretLock &
                            SecretProof &
                            HashLock &
                            Aggregate &
                            AccountLinkTransaction &
                            MultisigModification &
                            AccountAddressRestrictionTransaction &
                            AccountMosaicRestrictionTransaction &
                            AccountOperationRestrictionTransaction &
                            Cosign &
                            MosaicGlobalRestrictionTransaction &
                            MosaicAddressRestrictionTransaction

export type $NEM2SignTransaction = $Common & {
    path: $Path,
    transaction: Transaction,
}
// get public key

export type $NEM2GetPublicKey = $Common & {
    path: $Path,
    showDisplay: boolean,
}

export type NEM2SignedTransaction = {
    success: true,
    payload: NEM2SignedTx | NEM2CosignatureSignedTx,
} | Unsuccessful$;

export type $NEM2EncryptMessage = $Common & {
    recipientPublicKey: string, // Public key of message recipient
    payload: string,
}

export type NEM2EncryptedMessage = {
    payload: string,
} | Unsuccessful$;

export type $NEM2DecryptMessage = $Common & {
    senderPublicKey: string, // Public key of message encrypter
    payload: string,
}

export type NEM2DecryptedMessage = {
    payload: string,
} | Unsuccessful$;
