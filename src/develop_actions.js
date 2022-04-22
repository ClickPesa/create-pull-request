const axios = require("axios");
const github = require("@actions/github");
const core = require("@actions/core");

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const SLACK_WEBHOOK_URL = core.getInput("SLACK_WEBHOOK_URL");
const octokit = github.getOctokit(GITHUB_TOKEN);
const { context = {} } = github;

const run = async () => {
  const branch_name = context.payload?.head_commit?.message
    ?.split("from")[1]
    .split("\n")[0]
    ?.split("/")
    .slice(1)
    .join("/");

  // fetching commits
  let commits = "";
  try {
    const compare_commits = await octokit.request(
      `GET /repos/${context.payload?.repository?.full_name}/compare/staging...${branch_name}`,
      {
        owner: context.payload?.repository?.owner?.login,
        repo: context.payload?.repository?.name,
        base: "staging",
        head: branch_name,
      }
    );

    let commits = "";

    if (compare_commits?.data?.commits?.length === 0) {
      commits = "";
      return;
    }

    compare_commits?.data?.commits?.forEach((e, i) => {
      if (
        !e?.commit?.message.includes("Merge") &&
        !e?.commit?.message.includes("Merged") &&
        !e?.commit?.message.includes("skip") &&
        !e?.commit?.message.includes("Skip")
      )
        commits =
          i === 0
            ? "> " + e.commit.message
            : commits + "\n\n" + "> " + e.commit.message;
    });

    // fetch pr from branch_name to staging to check if it exists
    // if pr exists, update
    // if not create
  } catch (error) {
    console.log(error?.message);
  }

  //   attempt to create PR
  try {
    let options = {
      blocks: [
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `<:sparkles: PR was created from ${branch_name} to staging>`,
            },
          ],
        },
      ],
    };
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
    if (createpr?.data) {
      axios
        .post(SLACK_WEBHOOK_URL, JSON.stringify(options))
        .then((response) => {
          console.log("SUCCEEDED: Sent slack webhook", response.data);
        })
        .catch((error) => {
          console.log("FAILED: Send slack webhook", error);
        });
      return;
    }
  } catch (error) {
    console.log("error", error?.message);
  }

  //   update PR
  try {
    const options = {
      blocks: [
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `<:sparkles: PR was updated from ${branch_name} to staging>`,
            },
          ],
        },
      ],
    };
    //   fetching existing PR
    const existing_pr = await octokit.rest.pulls.list({
      owner: context.payload?.repository?.owner?.login,
      repo: context.payload?.repository?.name,
      state: "open",
      head: branch_name,
      base: "staging",
    });

    if (existing_pr?.data) {
      // update pr
      const update_pr = await octokit.rest.pulls.update({
        pull_number: existing_pr?.data[0].number,
        owner: context.payload?.repository?.owner?.login,
        repo: context.payload?.repository?.name,
        title: branch_name,
        body: commits,
        head: branch_name,
        base: "staging",
      });
      if (update_pr.data) {
        // send slack notification
        axios
          .post(SLACK_WEBHOOK_URL, JSON.stringify(options))
          .then((response) => {
            console.log("SUCCEEDED: Sent slack webhook", response.data);
          })
          .catch((error) => {
            console.log("FAILED: Send slack webhook", error);
          });
        return;
      }
    }
  } catch (error) {
    console.log("error", error?.message);
  }
};

run();

// $GITHUB_REF would look like (refs/pull/33/merge), $GITHUB_HEAD_REF would just store the source branch name while $GITHUB_BASE_REF would represent RP destination branch. Maybe you can update your answer to fallback to $GITHUB_HEAD_REF
// ${GITHUB_REF##*/}
