# Tracking org-wide issues easily
Github hooks + sync APIs that load issue data into postgres.
Use metabase for project management.

#### Webhook to upsert issue info
This github webhook will upsert issue info:

```http
GET
https://app.cluster.hasura-app.io/webhook
```

#### Initialise org members
This API call will upsert members:

```http
GET
https://app.cluster.hasura-app.io/add_org_members
```

#### Initialise org repos
This API call will upsert members:

```http
GET
https://app.cluster.hasura-app.io/add_org_repos
```

#### Initialise issues on a repo
This API call will upsert issues from the repo:

```http
GET
https://app.cluster.hasura-app.io/<repo>/sync_issues
```

You need to call this API for each repo in the `repo` table.

-----------------------------------------------------------

All of this can be used to create a metabase dashboard like this:


