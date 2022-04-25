const axios = require("axios");
const github = require("@actions/github");
const core = require("@actions/core");

const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const SLACK_WEBHOOK_URL = core.getInput("SLACK_WEBHOOK_URL");
const DESTINATION_BRANCH = core.getInput("DESTINATION_BRANCH");
const octokit = github.getOctokit(GITHUB_TOKEN);
const { context = {} } = github;

const run = async () => {
  let branch_name = context.payload?.head_commit?.message
    ?.split("from")[1]
    ?.split("\n")[0]
    ?.split("/")
    ?.slice(1)
    ?.join("/");

  if (branch_name === "" || branch_name === undefined || branch_name === null) {
    branch_name = context.payload.ref?.replace("refs/heads/", "");
  }

  // fetching commits
  let commits = "";
  try {
    const compare_commits = await octokit.request(
      `GET /repos/${context.payload?.repository?.full_name}/compare/${DESTINATION_BRANCH}...${branch_name}`,
      {
        owner: context.payload?.repository?.owner?.login,
        repo: context.payload?.repository?.name,
        base: DESTINATION_BRANCH,
        head: branch_name,
      }
    );

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
  } catch (error) {
    console.log(error?.message);
  }

  console.log(commits);

  //   attempt to create PR
  try {
    let options = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":sparkles:  New notification sent from github actions",
            emoji: true,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `> Pull request was created from ${branch_name} to ${DESTINATION_BRANCH}`,
            },
          ],
        },
      ],
    };
    if (commits != "") {
      const createpr = await createorupdatepr({
        branch: branch_name,
        body: commits,
        owner: context.payload?.repository?.owner?.login,
        repo: context.payload?.repository?.name,
        full_name: context.payload?.repository?.full_name,
      });
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
    } else {
      console.log("No commits to create this PR");
    }
  } catch (error) {
    console.log("error", error?.message);
  }
  //   update PR
  try {
    const options = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":sparkles:  New notification sent from github actions",
            emoji: true,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `> Pull request was updated from ${branch_name} to ${DESTINATION_BRANCH}`,
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
      base: DESTINATION_BRANCH,
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
        base: DESTINATION_BRANCH,
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

const createorupdatepr = async ({ branch, owner, repo, body, full_name }) => {
  try {
    const existing_pr = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
      head: owner + ":" + branch,
      base: DESTINATION_BRANCH,
    });
    if (existing_pr?.data?.length === 0) {
      // create new pr
      const createpr = await octokit.request(`POST /repos/${full_name}/pulls`, {
        owner,
        repo,
        title: branch,
        body,
        head: branch,
        base: DESTINATION_BRANCH,
      });
      return createpr;
    } else {
      // update existing pr
      const updatepr = await octokit.rest.pulls.update({
        pull_number: existing_pr?.data[0].number,
        owner,
        repo,
        title: branch,
        body,
        head: branch,
        base: DESTINATION_BRANCH,
      });
      return updatepr;
    }
  } catch (error) {
    console.log(error.message);
    let options = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New notification sent from github actions",
            emoji: true,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `❌ failed to create pull request to master due to - ${error?.message}`,
            },
          ],
        },
      ],
    };
    axios
      .post(SLACK_WEBHOOK_URL, JSON.stringify(options))
      .then((response) => {
        console.log("SUCCEEDED: Sent slack webhook", response.data);
      })
      .catch((error) => {
        console.log("FAILED: Send slack webhook", error);
      });
  }
};
