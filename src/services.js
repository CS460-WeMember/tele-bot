const fetch = require('cross-fetch/polyfill');
const PocketBase = require('pocketbase/cjs')

const client = new PocketBase('http://129.150.56.59:8090');

const getRegular = async () => {
    const list = await client.collection("regular").getFullList({
        sort: "-created",
      });
      return list;
}

const getAdHoc = async () => {
    const list = await client.collection("adhoc").getFullList({
        sort: "-created",
      });
      return list;
}

const createAdHoc = async (data) => {
    console.log(data);
    //const record = await client.records.create('adhoc', data);
    const record = await client.collection("adhoc").create(data);
    console.log(record);
}

const createRegular = async (data) => {
    console.log(data);
    //const record = await client.records.create('adhoc', data);
    const record = await client.collection("regular").create(data);
    console.log(record);
}

const createTest = async (data) => {
    console.log(data);
    //const record = await client.records.create('adhoc', data);
    const record = await client.collection("test").create(data);
    console.log(record);
}

module.exports = { getRegular, getAdHoc, createAdHoc, createTest, createRegular};