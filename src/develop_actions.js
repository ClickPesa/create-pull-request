const axios = require("axios");
const github = require("@actions/github");
const core = require("@actions/core");

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const SLACK_WEBHOOK_URL = core.getInput("SLACK_WEBHOOK_URL");
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

    let commits = "";

    context.payload?.commits?.forEach((e, i) => {
      if (
        !e.message.includes("Merge") &&
        !e.message.includes("Merged") &&
        !e.message.includes("skip") &&
        !e.message.includes("Skip")
      )
        commits =
          i === 0 ? "> " + e.message : commits + "\n\n" + "> " + e.message;
    });

    // fetch pr from branch_name to staging to check if it exists
    // if pr exists, update
    // if not create

    const createpr = await octokit.request(
      `POST /repos/${context.payload?.repository?.full_name}/pulls`,
      {
        owner: context.payload?.repository?.owner?.login,
        repo: context.payload?.repository?.name,
        title: branch_name,
        body: commits,
        head: branch_name,
        base: "staging",
      }
    );
    const compare_commits = await octokit.request(
      `GET /repos/${context.payload?.repository?.full_name}/compare/staging...${branch_name}`,
      {
        owner: context.payload?.repository?.owner?.login,
        repo: context.payload?.repository?.name,
        base: "staging",
        head: branch_name,
      }
    );
    console.log("compare commit", compare_commits);
    if (createpr?.data) {
      axios
        .post(
          SLACK_WEBHOOK_URL,
          JSON.stringify(
            `PR from ${branch_name} to staging was created successfully`
          )
        )
        .then((response) => {
          console.log("SUCCEEDED: Sent slack webhook", response.data);
        })
        .catch((error) => {
          console.log("FAILED: Send slack webhook", error);
        });
    } else {
      // update existing pr
      console.log("pr exists");
      axios
        .post(
          SLACK_WEBHOOK_URL,
          JSON.stringify(`PR from ${branch_name} to staging already exist`)
        )
        .then((response) => {
          console.log("SUCCEEDED: Sent slack webhook", response.data);
        })
        .catch((error) => {
          console.log("FAILED: Send slack webhook", error);
        });
    }
  } catch (error) {
    console.log("error", error?.message);
  }
};

run();

// $GITHUB_REF would look like (refs/pull/33/merge), $GITHUB_HEAD_REF would just store the source branch name while $GITHUB_BASE_REF would represent RP destination branch. Maybe you can update your answer to fallback to $GITHUB_HEAD_REF
// ${GITHUB_REF##*/}
