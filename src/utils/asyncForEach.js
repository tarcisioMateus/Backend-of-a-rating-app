async function asyncForEach (array, callback) {
    for (let entry of array) {
        await callback(entry)
    }
}

module.exports = asyncForEach