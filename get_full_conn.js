const { execSync } = require('child_process');
const projectId = 'empty-term-45875818';
try {
    const conn = execSync(`npx neonctl connection-string --project-id ${projectId}`).toString().trim();
    console.log('CONN_START');
    console.log(conn);
    console.log('CONN_END');
} catch (e) {
    console.error(e);
}
