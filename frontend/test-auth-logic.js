const bcrypt = require('bcryptjs');

async function test() {
    const inputPass = "DrKal@Secure2026";
    const dbHash = "$2b$10$Bz47n4m67LJCLYW.PrWjP.yEhRgYYjxl/Vt4I.em3gQWFXG3lQf3C";

    const match = await bcrypt.compare(inputPass, dbHash);
    console.log(`Password: ${inputPass}`);
    console.log(`Hash: ${dbHash}`);
    console.log(`Match Result: ${match}`);

    const inputPass2 = "123456";
    const dbHash2 = "$2b$10$1Cjbrqa/FwngohssyXFeR.oaQngBOIjlalBrfUiN1LPinHeGb32zm";
    const match2 = await bcrypt.compare(inputPass2, dbHash2);
    console.log(`Password: ${inputPass2}`);
    console.log(`Match Result: ${match2}`);
}

test();
