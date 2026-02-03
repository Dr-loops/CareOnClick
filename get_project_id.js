const { execSync } = require('child_process');
try {
    const raw = execSync('npx neonctl projects list --output json').toString();
    const projects = JSON.parse(raw);
    console.log('PROJECT_ID_START');
    console.log(projects[0].id);
    console.log('PROJECT_ID_END');
} catch (e) {
    console.error(e);
}
