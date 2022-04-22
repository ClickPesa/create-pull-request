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
  try {
    const octokit = new Octokit({ auth: process.argv[4] });
    const pulls = await octokit.request("GET /repos/bmsteven/demo/pulls", {
      owner: "bmsteven",
      repo: "demo",
      base: "staging",
    });
    console.log("pulls", pulls?.data);

    const pull = await octokit.request("GET /repos/bmsteven/demo/pulls/18", {
      owner: "bmsteven",
      repo: "demo",
      pull_number: "18",
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
        pull_number: "18",
      }
    );
    console.log("commits", commits?.data);
    // check if pull request was merged
    const checkPulls = await octokit.request(
      "GET /repos/bmsteven/demo/pulls/18/merge",
      {
        owner: "bmsteven",
        repo: "demo",
        pull_number: "18",
      }
    );
    console.log("checkPulls", checkPulls?.data);
    // merge pull request
    const mergepr = await octokit.request(
      "PUT /repos/bmsteven/demo/pulls/16/merge",
      {
        owner: "bmsteven",
        repo: "demo",
        pull_number: "18",
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
  } catch (error) {
    console.log(error?.message);
  }
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

// create pr action
// name: Pull Request Action
// on:
//   push:
//     branches:
//       - feature/*
//       - test/*
//       - test

// jobs:
//   create-pull-request:
//     runs-on: ubuntu-latest
//     steps:
//       - name: Check out repository code
//         uses: actions/checkout@v2
//       - name: pull-request
//         uses: repo-sync/pull-request@v2
//         with:
//           destination_branch: "develop"
//           github_token: ${{ secrets.GITHUB_TOKEN }}
//           pr_label: "feature, automated pr"
//           pr_title: "[Example] Simple demo"

// name: test

// on:
//   pull_request:
//     branches: [master, develop, staging]

// jobs:
//   build:
//     runs-on: ubuntu-latest

//     steps:
//       - name: Check Out Repo
//         uses: actions/checkout@v2

//       # - name: 🔀 Merge Pull Request
//       #   uses: BaharaJr/merge-pr@0.0.1
//       #   with:
//       #     GITHUB_TOKEN: ${{ secrets.TOKEN }}

// name: NodeJS with Gulp

// on:
//   push:
//     branches: [ develop ]
//     paths: ["gulpfile.js"]
//   pull_request:
//     branches: [ develop ]
//     paths: ["gulpfile.js"]

// jobs:
//   build:
//     runs-on: ubuntu-latest

//     strategy:
//       fail-fast: false
//       matrix:
//         node-version: [12.x, 14.x, 16.x]

//     steps:
//     - uses: actions/checkout@v3

//     - name: Use Node.js ${{ matrix.node-version }}
//       uses: actions/setup-node@v3
//       with:
//         node-version: ${{ matrix.node-version }}

//     - name: Build
//       run: npm install

//     - name: gulp
//       run: npm install -g gulp axios @octokit/core

//     - name: notify
//       # run: gulp createnotification --b ${{ secrets.SLACK_WEBHOOK_URL }}
//       run: gulp getpulls --b ${{ secrets.TOKEN }}
