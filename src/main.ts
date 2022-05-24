/* eslint-disable camelcase */
import * as github from '@actions/github'
import * as core from '@actions/core'

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
const DESTINATION_BRANCH = core.getInput('DESTINATION_BRANCH')
const HEAD_BRANCH = core.getInput('HEAD_BRANCH')
const KEYWORD = core.getInput('KEYWORD')
const octokit = github.getOctokit(GITHUB_TOKEN)
const {context = {}}: any = github

async function run() {
  const eventName = context.eventName
  switch (eventName) {
    case 'push':
      return pr()
    case 'pull_request':
      core.warning(
        `Event <${context.eventName}> is still WIP and will be available soon. Please submit an issue to the repo for quick delivery.`
      )
      break
    default:
      return pr()
  }
}
const createorupdatepr = async ({branch, owner, repo, body, full_name}) => {
  try {
    const existing_pr = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      head: owner + ':' + branch,
      base: DESTINATION_BRANCH
    })
    if (existing_pr?.data?.length === 0) {
      // create new pr
      const createpr = await octokit.request(`POST /repos/${full_name}/pulls`, {
        owner,
        repo,
        title: branch,
        body,
        head: branch,
        base: DESTINATION_BRANCH
      })
      return createpr
    } else {
      // update existing pr
      const updatepr = await octokit.rest.pulls.update({
        pull_number: existing_pr?.data[0].number,
        owner,
        repo,
        title: branch,
        body,
        head: branch,
        base: DESTINATION_BRANCH
      })
      return updatepr
    }
  } catch (e) {
    core.setFailed('error' + e.message)
  }
}
const checkCompareCommits = async ({head, owner, full_name, repo}) => {
  try {
    let {commits} = (
      await octokit.request(
        `GET /repos/${full_name}/compare/${DESTINATION_BRANCH}...${head}`,
        {
          owner,
          repo,
          base: DESTINATION_BRANCH,
          head
        }
      )
    ).data
    if ((commits || []).length === 0) {
      core.warning('Trigger has no commit')
      return
    }

    commits = (commits || [])
      .map((e, i) => {
        return i === 0 ? '> ' + e.commit.message : e.commit.message
      })
      .join('\n\n' + '> ')

    const createpr = await createorupdatepr({
      branch: head,
      owner,
      repo,
      full_name,
      body: commits
    })
    core.setOutput('pr_body', commits)
    core.setOutput('branch', head)
    core.info(JSON.stringify(createpr?.data))
  } catch (e) {
    core.setFailed(e.message)
  }
}
const pr = async () => {
  try {
    let branch: any = HEAD_BRANCH
    const {message} = context?.payload?.head_commit
    if (!HEAD_BRANCH) {
      branch = context?.payload?.ref?.split('/')
      branch[branch.length - 1]
    }

    if (!KEYWORD) {
      await checkCompareCommits({
        head: branch,
        owner: context?.payload?.repository?.owner?.login,
        full_name: context?.payload?.repository?.full_name,
        repo: context?.payload?.repository?.name
      })
      return
    }
    if (!message.includes(KEYWORD)) {
      core.info('Not a PR message')
      return
    }
    await checkCompareCommits({
      head: branch[branch.length - 1],
      owner: context?.payload?.repository?.owner?.login,
      full_name: context?.payload?.repository?.full_name,
      repo: context?.payload?.repository?.name
    })
  } catch (e) {
    core.setFailed('not error' + e.message)
  }
}
run()
