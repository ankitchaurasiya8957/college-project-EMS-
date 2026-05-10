const bcrypt = require('bcryptjs');

async function test() {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hashSync('password123', salt);
    console.log('Hash:', hash);
    const isMatch = await bcrypt.compare('password123', hash);
    console.log('Is match?', isMatch);
}
test();
