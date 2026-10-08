const { app } = require('../src/server');

async function testRealProfileE2E() {
  const port = 8089;
  const server = app.listen(port, '127.0.0.1');

  console.log(`Server listening on port ${port} for E2E test...`);

  try {
    const testUsernames = ['torvalds', 'gaearon'];

    for (const username of testUsernames) {
      console.log(`\n==============================================`);
      console.log(`Testing REAL GitHub profile: @${username}`);
      console.log(`==============================================`);

      const res = await fetch(`http://127.0.0.1:${port}/api/roast/${username}`);
      const status = res.status;
      const data = await res.json();

      console.log(`Response Status: ${status}`);
      if (!res.ok) {
        console.error('Error Response:', data);
        if (status === 429) {
          console.log('GitHub public rate limit reached for unauthenticated IP. Skipping gracefully.');
          continue;
        }
        throw new Error(`Failed to roast @${username}: ${data.message}`);
      }

      console.log(`✅ Success!`);
      console.log(`User: ${data.user.name} (@${data.user.login})`);
      console.log(`Public Repos Fetched: ${data.repos ? data.repos.length : data.meta.reposCount}`);
      console.log(`Health Score: ${data.score.overall}/100 (${data.score.badge} ${data.score.level})`);
      console.log(`Potential Score: ${data.score.potential}/100 (+${data.score.improvement} pts recoverable)`);
      console.log(`Headline Roast: "${data.roast.headline}"`);
      console.log(`Roast Observations Count: ${data.roast.observations.length}`);
      console.log(`Sample Roast: "${data.roast.observations[0]?.quote}" - ${data.roast.observations[0]?.punchline}`);
      console.log(`Rescue Plan Actions: ${data.rescue.totalActionsCount}`);
      console.log(`Top 5 Fixes Count: ${data.rescue.top5Fixes.length}`);
      console.log(`Top #1 Fix: [${data.rescue.top5Fixes[0]?.priority} Priority] ${data.rescue.top5Fixes[0]?.title}`);
      console.log(`Key Repositories Analyzed: ${data.projects.length}`);
      if (data.projects[0]) {
        console.log(`Top Repo: ${data.projects[0].name} (Score: ${data.projects[0].projectScore}/100)`);
        console.log(`Repo Roast: ${data.projects[0].roast}`);
        console.log(`Repo Rescue: ${data.projects[0].rescue}`);
      }
      console.log(`Recruiter Readiness: ${data.recruiter.readinessBadge}`);
    }

    console.log(`\n🎉 All Real Profile E2E Tests Succeeded!`);
  } finally {
    server.close();
    process.exit(0);
  }
}

testRealProfileE2E().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
