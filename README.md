# Tracking org-wide issues easily
Github hooks + sync APIs that load issue data into postgres.
Use metabase for project management.

For setup/installation instructions refer to: [Usage guide](guide.md).


## How it works

This application initialises github org data and then syncs changes from github using a webhook. All this data in initialised and synced into a postgres database.
Once data is in postgres, you can use metabase 🐘🎉🐘🎉

![hasura-issues](images/hasura-issues.png)

### Webhook to upsert issue info

This github webhook will upsert issue info into postgres when issues get created/updated on github:

```http
GET
https://app.cluster.hasura-app.io/webhook
```

### Initialise org members
This API call will upsert members:

```http
GET
https://app.cluster.hasura-app.io/add_org_members
```

### Initialise org repos
This API call will upsert members:

```http
GET
https://app.cluster.hasura-app.io/add_org_repos
```

### Initialise issues on a repo
This API call will upsert issues from the given repo:

```http
GET
https://app.cluster.hasura-app.io/<repo>/sync_issues
```

You need to call this API for each repo in the `repo` table.

-----------------------------------------------------------

## Assumptions:

- label that contains the string bug is assumed to be a bug type label
- label that contains the string longterm is assuemed to be a low-priority long-term issue

-----------------------------------------------------------

## Desired metrics to be captured

**Unassigned issues**
Triaging speed: Open issues that haven't been assigned to people.
![unassigned-issues](https://raw.githubusercontent.com/hasura/issues/master/screenshots/unassigned-issues.png)


**Open issues/bugs**
Work load: Open issues that have been assigned to people and that are not longterm issues
![open-issues-bugs](https://raw.githubusercontent.com/hasura/issues/master/screenshots/open-issues-open-bugs.png)

**Closing rate / dev**
Rough estimate of per developer efficiency:
Time it takes for an issue to go from created to done
![closing-rate](https://raw.githubusercontent.com/hasura/issues/master/screenshots/avg-days-to-close-issue-per-dev.png)

**Total days of work ahead / dev**
Closing rate * open issues: How many days in the future will the developer spend on getting their work done
![workload](https://raw.githubusercontent.com/hasura/issues/master/screenshots/total-days-required-by-each-dev-to-close-open-issues.png)

-----------------------------------------------------------
