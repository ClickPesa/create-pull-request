const axios = require("axios");
const github = require("@actions/github");
const core = require("@actions/core");
// const response = require("../res");

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const octokit = github.getOctokit(GITHUB_TOKEN);
const { context = {} } = github;

const run = async () => {
  //   console.log(context.payload);
  //   console.log(GITHUB_TOKEN);
  //   console.log("test actions");
  try {
    const branch_name = context.payload?.head_commit?.message
      ?.split("from")[1]
      .split("\n")[0];

    console.log(branch_name);

    const createpr = await octokit.request("POST /repos/bmsteven/demo/pulls", {
      owner: "bmsteven",
      repo: "demo",
      title: "Amazing new feature",
      body: "Please pull these awesome changes in!",
      head: branch_name,
      base: "staging",
    });
    console.log("createPr", createpr?.data);
  } catch (error) {
    console.log("error", error?.message);
  }
};

run();

// $GITHUB_REF would look like (refs/pull/33/merge), $GITHUB_HEAD_REF would just store the source branch name while $GITHUB_BASE_REF would represent RP destination branch. Maybe you can update your answer to fallback to $GITHUB_HEAD_REF
// ${GITHUB_REF##*/}
