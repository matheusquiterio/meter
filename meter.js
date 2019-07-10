/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Meter extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const measures = [
            {
                active: '220',
                reactive: '96',
                solar: '55',
                ownerID: 'user1'
            },
            {
                active: '450',
                reactive: '192',
                solar: '88',
                ownerID: 'user2'
            },
            {
                active: '620',
                reactive: '264',
                solar: '130',
                ownerID: 'user3'
            },
        ];

        for (let i = 0; i < measures.length; i++) {
            measures[i].docType = 'house';
            await ctx.stub.putState('HOUSE' + i, Buffer.from(JSON.stringify(measures[i])));
            console.info('Added <--> ', measures[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryHouse(ctx, houseNumber) {
        const houseAsBytes = await ctx.stub.getState(houseNumber); // get the house from chaincode state
        if (!houseAsBytes || houseAsBytes.length === 0) {
            throw new Error(`${houseNumber} does not exist`);
        }
        console.log(houseAsBytes.toString());
        return houseAsBytes.toString();
    }

    async createHouse(ctx, houseNumber, active, reactive, solar, ownerID) { //pega os dados do medidor
        console.info('============= START : Coletando dados ===========');

        const measures = {
            active,
            docType: 'house',
            reactive,
            solar,
            ownerID,
        };

        await ctx.stub.putState(houseNumber, Buffer.from(JSON.stringify(measures)));
        console.info('============= END : Dados coletados ===========');
    }

    async queryAllHouses(ctx) {
        const startKey = 'HOUSE0';
        const endKey = 'HOUSE999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async changeHouseOwner(ctx, houseNumber, newOwner) {
        console.info('============= START : changeHouseOwner ===========');

        const houseAsBytes = await ctx.stub.getState(houseNumber); // get the house from chaincode state
        if (!houseAsBytes || houseAsBytes.length === 0) {
            throw new Error(`${houseNumber} does not exist`);
        }
        const house = JSON.parse(houseAsBytes.toString());
        house.ownerID = newOwner;

        await ctx.stub.putState(houseNumber, Buffer.from(JSON.stringify(house)));
        console.info('============= END : changeHouseOwner ===========');
    }

    async updateMeasures(ctx, houseNumber, newActive, newReactive, newSolar) {
        console.info('============= START : Update Measures ===========');

        const houseAsBytes = await ctx.stub.getState(houseNumber); // get the house from chaincode state
        if (!houseAsBytes || houseAsBytes.length === 0) {
            throw new Error(`${houseNumber} does not exist`);
        }
        const house = JSON.parse(houseAsBytes.toString());
        house.active = newActive;
        house.reactive = newReactive;
        house.solar = newSolar;

        await ctx.stub.putState(houseNumber, Buffer.from(JSON.stringify(house)));
        console.info('============= END : Update Measures ===========');
    }


}

module.exports = Meter;

