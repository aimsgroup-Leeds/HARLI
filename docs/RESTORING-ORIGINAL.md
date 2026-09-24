# Restore original HARLI content

The original site immediately before the visual refresh is preserved as:

- Annotated Git tag: `backup/pre-refresh-2026-09-24` (pushed to GitHub).
- Original commit: `cfb694de6956418899baba75ccb18f1b8ccd5bbd`.
- [Browse the original files](https://github.com/aimsgroup-Leeds/HARLI/tree/backup/pre-refresh-2026-09-24).
- [Publication PR #1](https://github.com/aimsgroup-Leeds/HARLI/pull/1) records the merge commit for the refresh.

An additional local backup includes the complete original file archive, an
extracted copy, a verified Git bundle, the HTML fetched from the live site
before publication, and SHA-256 checksums. It is stored outside the deployed
repository at `../HARLI-backups/2026-09-24-pre-refresh/` in the author's workspace.

## Restore only a paragraph, illustration or interaction

Start a new branch from the latest shared version:

```sh
git fetch origin --tags
git switch -c restore-original-content origin/main
git show backup/pre-refresh-2026-09-24:index.html > /tmp/harli-original-index.html
```

Read the original file and copy only the requested content into the current
page. For an original interactive illustration, recover its matching SVG or
canvas markup, styles and script together, checking element IDs against the
current page. Leave unrelated later edits in place. Preview the result, commit
it, and submit a pull request. There is no need to roll back the entire redesign
to recover the supervisor's preferred text or figures.

## Restore the complete previous presentation

Create a rollback branch from the latest `origin/main` and use the merge commit
shown in PR #1:

```sh
git revert -m 1 <refresh-merge-commit>
```

Confirm that parent 1 is the pre-merge main branch. Review any conflicts with
later contributions, preview the result and merge the rollback pull request.
The existing GitHub Pages workflow then publishes it. This preserves history
and later work; do not reset or force-push shared main.

The backup tag and local archives remain available even after a later merge,
revert or removal of the feature branch.
