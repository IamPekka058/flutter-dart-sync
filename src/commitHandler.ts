import * as core from '@actions/core'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import { getPubspecFile } from './fileHandler.js'
/**
 * Commits the current changes to the repository.
 */
async function commitChanges(pubspecPath: string): Promise<void> {
  const signCommit = core.getInput('commit_changes') === 'true'

  if (!signCommit) {
    core.info('Skipping commit as commit_changes is set to false')
    return
  }

  const commitMessage = core.getInput('commit_message')
  const gh_app_id = core.getInput('gh_app_id')
  const gh_installation_id = core.getInput('gh_installation_id')
  const gh_private_key = core.getInput('gh_private_key')

  if (
    commitMessage === '' ||
    gh_app_id === '' ||
    gh_installation_id === '' ||
    gh_private_key === ''
  ) {
    core.warning(
      'One or more required inputs are missing regarding commit. Skipping commit.'
    )
    return
  }

  const auth = createAppAuth({
    appId: gh_app_id,
    privateKey: gh_private_key,
    installationId: gh_installation_id
  })
  const installationAuth = await auth({
    type: 'installation',
    installationId: gh_installation_id
  })
  const octokit = new Octokit({ auth: installationAuth.token })

  const refData = await octokit.git.getRef({
    owner: process.env.GITHUB_REPOSITORY!.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY!.split('/')[1],
    ref: `heads/${process.env.GITHUB_REF!.split('/')[2]}`
  })

  const commitData = await octokit.git.getCommit({
    owner: process.env.GITHUB_REPOSITORY!.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY!.split('/')[1],
    commit_sha: refData.data.object.sha
  })

  const baseTree = commitData.data.tree.sha

  const newTree = await octokit.git.createTree({
    owner: process.env.GITHUB_REPOSITORY!.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY!.split('/')[1],
    tree: [
      {
        path: pubspecPath,
        mode: '100644',
        type: 'blob',
        content: getPubspecFile(pubspecPath)
      }
    ],
    base_tree: baseTree
  })

  const newCommit = await octokit.git.createCommit({
    owner: process.env.GITHUB_REPOSITORY!.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY!.split('/')[1],
    message: commitMessage,
    tree: newTree.data.sha,
    parents: [commitData.data.sha]
  })

  await octokit.git.updateRef({
    owner: process.env.GITHUB_REPOSITORY!.split('/')[0],
    repo: process.env.GITHUB_REPOSITORY!.split('/')[1],
    ref: `heads/${process.env.GITHUB_REF!.split('/')[2]}`,
    sha: newCommit.data.sha
  })

  core.info('Changes committed successfully.')
  return
}

export function commitWithApp(pubspecPath: string) {
  commitChanges(pubspecPath).catch((error) => {
    core.setFailed(
      `Failed to commit changes: ${error instanceof Error ? error.message : String(error)}`
    )
  })
}
