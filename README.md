# Tracking org-wide issues easily
Github hooks + sync APIs that load issue data into postgres.
Use metabase for project management.

### Webhook to upsert issue info
This github webhook will upsert issue info:

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

All of this can be used to create a metabase dashboard like this:

**Unassigned issues**
![unassigned-issues](https://raw.githubusercontent.com/hasura/issues/master/screenshots/unassigned-issues.png)

**Open issues/bugs**
![open-issues-bugs](https://raw.githubusercontent.com/hasura/issues/master/screenshots/open-issues-open-bugs.png)

**Closing rate / dev**
![closing-rate](https://raw.githubusercontent.com/hasura/issues/master/screenshots/avg-days-to-close-issue-per-dev.png)

**Total days of work ahead / dev**
![workload](https://raw.githubusercontent.com/hasura/issues/master/screenshots/total-days-required-by-each-dev-to-close-open-issues.png)
