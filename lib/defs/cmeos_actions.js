"use strict";

module.exports = db => {
    let CmeosActions = db.define('cmeos_actions', {
        id: {
            type: "serial",
            size: 8,
            key: true,
            big: true
        },
        global_sequence: {
            index: "trx_global_index",
            required: true,
            type: "text",
            size: 64
        },
        trx_id: {
            index: "trx_global_index",
            required: true,
            type: "text",
            size: 64
        },
        contract_action: {
            required: true,
            type: "text",
            size: 64
        },
        rawData: {
            required: true,
            type: "object",
            big: true
        }
    });

    CmeosActions.hasOne('parent', CmeosActions, {
        key: true,
        reverse: "inline_action"
    });

    CmeosActions.hasOne('transaction', db.models.Cmeos_transactions, {
        key: true,
        reverse: "actions"
    });

    return CmeosActions;
}