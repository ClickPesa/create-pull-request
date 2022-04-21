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
  console.log("pulls", pulls?.data);

  const pull = await octokit.request("GET /repos/bmsteven/demo/pulls/16", {
    owner: "bmsteven",
    repo: "demo",
    pull_number: "16",
  });
  console.log("pull", pull?.data);
  // update pull request
  // await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
  //   owner: "OWNER",
  //   repo: "REPO",
  //   pull_number: "PULL_NUMBER",
  //   title: "new title",
  //   body: "updated body",
  //   state: "open",
  //   base: "master",
  // });
  // get pull request commits
  const commits = await octokit.request(
    "GET /repos/bmsteven/demo/pulls/16/commits",
    {
      owner: "bmsteven",
      repo: "demo",
      pull_number: "16",
    }
  );
  console.log("commits", commits?.data);
  // check if pull request was merged
  const checkPulls = await octokit.request(
    "GET /repos/bmsteven/demo/pulls/16/merge",
    {
      owner: "bmsteven",
      repo: "demo",
      pull_number: "16",
    }
  );
  console.log("checkPulls", checkPulls?.data);
  // merge pull request
  const mergepr = await octokit.request(
    "PUT /repos/bmsteven/demo/pulls/16/merge",
    {
      owner: "bmsteven",
      repo: "demo",
      pull_number: "16",
    }
  );
  console.log("mergepr", mergepr?.data);
  // create new pull request
  const createPr = await octokit.request("POST /repos/bmsteven/demo/pulls", {
    owner: "bmsteven",
    repo: "demo",
    title: "Amazing new feature",
    body: "Please pull these awesome changes in!",
    head: "staging",
    base: "master",
  });
  console.log("createPr", createPr?.data);
});

// scheduled
// on:
//   schedule:
//     - cron: '30 5 * * 1,3'
//     - cron: '30 5 * * 2,4'

// jobs:
//   test_schedule:
//     runs-on: ubuntu-latest
//     steps:
//       - name: Not on Monday or Wednesday
//         if: github.event.schedule != '30 5 * * 1,3'
//         run: echo "This step will be skipped on Monday and Wednesday"
//       - name: Every time
//         run: echo "This step will always run"
