const axios = require("axios");
const github = require("@actions/github");
const core = require("@actions/core");
// const response = require("../res");

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const octokit = github.getOctokit(GITHUB_TOKEN);
const { context = {} } = github;

const run = async () => {
  try {
    const branch_name = context.payload?.head_commit?.message
      ?.split("from")[1]
      .split("\n")[0]
      ?.split("/")
      .slice(1)
      .join("/");

    console.log("branch name", branch_name);
    console.log("full name", context.payload?.full_name);
    console.log("owner", context.payload?.owner?.login);
    console.log("repo", context.payload?.repository?.name);

    console.log("commits", context.payload?.commits);
    let commits = "";

    context.payload?.commits?.forEach((e, i) => {
      if (
        !e.message.includes("Merge") &&
        !e.message.includes("Merged") &&
        !e.message.includes("skip") &&
        !e.message.includes("Skip")
      )
        commits =
          commits + i !== 0 ? "> " + e.message : "\n\n" + "> " + e.message;
    });

    console.log("formatted commits", commits);

    const createpr = await octokit.request(
      `POST /repos/${context.payload?.full_name}/pulls`,
      {
        owner: context.payload?.owner?.login,
        repo: context.payload?.repository?.name,
        title: branch_name,
        body: commits,
        head: branch_name,
        base: "staging",
      }
    );
    console.log("createPr", createpr?.data);
  } catch (error) {
    console.log("error", error?.message);
  }
};

run();

// $GITHUB_REF would look like (refs/pull/33/merge), $GITHUB_HEAD_REF would just store the source branch name while $GITHUB_BASE_REF would represent RP destination branch. Maybe you can update your answer to fallback to $GITHUB_HEAD_REF
// ${GITHUB_REF##*/}
