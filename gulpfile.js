const gulp = require("gulp");
const axios = require("axios");
const { Octokit } = require("@octokit/core");

gulp.task("createnotification", async () => {
  const options = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: ":sparkles:  New notification sent via github actions",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            text: `<@null> <@null> <@null>  |  *engineering blog*  |  *null}* `,
            type: "mrkdwn",
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<https://github.com/clickpesa/engineering-blog/pulls>*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `sample from from github`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "Review Changes",
            },
            style: "primary",
            url: "https://staging--getpaidafrica.netlify.app//",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              emoji: true,
              text: "View Pull Request",
            },
            url: `https://github.com/clickpesa/engineering-blog/pulls`,
          },
        ],
      },
    ],
  };
  axios
    .post(`${process.argv[4]}`, JSON.stringify(options))
    .then((response) => {
      console.log("SUCCEEDED: Sent slack webhook", response.data);
      resolve(response.data);
    })
    .catch((error) => {
      console.log("FAILED: Send slack webhook", error);
      reject(new Error("FAILED: Send slack webhook"));
    });
});

gulp.task("getpulls", async () => {
  const octokit = new Octokit({ auth: process.argv[4] });
  const pulls = await octokit.request("GET /repos/bmsteven/demo/pulls", {
    owner: "bmsteven",
    repo: "demo",
    base: "staging",
  });
  console.log(pulls);

  // await octokit.request('POST /repos/{owner}/{repo}/pulls', {
  //   owner: 'OWNER',
  //   repo: 'REPO',
  //   title: 'Amazing new feature',
  //   body: 'Please pull these awesome changes in!',
  //   head: 'octocat:new-feature',
  //   base: 'master'
  // })
  const pull = await octokit.request("GET /repos/bmsteven/demo/pulls/16", {
    owner: "bmsteven",
    repo: "demo",
    pull_number: "16",
  });
  console.log(pull);
  // await octokit.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
  //   owner: 'OWNER',
  //   repo: 'REPO',
  //   pull_number: 'PULL_NUMBER',
  //   title: 'new title',
  //   body: 'updated body',
  //   state: 'open',
  //   base: 'master'
  // })
  const commits = await octokit.request(
    "GET /repos/bmsteven/demo/pulls/16/commits",
    {
      owner: "bmsteven",
      repo: "demo",
      pull_number: "16",
    }
  );
  console.log(commits);
  // await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
  //   owner: 'OWNER',
  //   repo: 'REPO',
  //   pull_number: 'PULL_NUMBER'
  // })
  // await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
  //   owner: 'OWNER',
  //   repo: 'REPO',
  //   pull_number: 'PULL_NUMBER'
  // })
});
