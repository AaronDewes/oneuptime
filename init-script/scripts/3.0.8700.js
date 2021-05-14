const { find, update } = require('../util/db');
const slugify = require('slugify');
const generate = require('nanoid/generate');
const logContainerCollection = 'applicationlogs';

async function run() {
    const logContainers = await find(logContainerCollection, {
        $or: [
            { slug: { $exists: false } },
            { slug: { $regex: /[*+~.()'"!:@]/g } },
        ],
    });
    for (let i = 0; i < logContainers.length; i++) {
        let { name } = logContainers[i];
        name = slugify(name, { remove: /[*+~.()'"!:@]/g });
        name = `${name}-${generate('1234567890', 8)}`;
        logContainers[i].slug = name.toLowerCase();
        await update(
            logContainerCollection,
            { _id: logContainers[i]._id },
            { slug: logContainers[i].slug }
        );
    }
    return `Script ran for ${logContainers.length} logContainers.`;
}
module.exports = run;
