'use strict';

const express = require('express');
const app = express();

app.get('/gitlab', (req, res) => {
  console.log('gitlab');
  const a = [
    {
      "id": 2306729,
      "iid": 31,
      "project_id": 1072407,
      "title": "In add custom API , providing image pull secret causes full creation failure because flow stops at creating secret",
      "description": "",
      "state": "closed",
      "created_at": "2016-05-26T11:05:10.638Z",
      "updated_at": "2016-05-26T19:43:07.704Z",
      "labels": [],
      "milestone": {
        "id": 61440,
        "iid": 1,
        "project_id": 1072407,
        "title": "danava",
        "description": "",
        "state": "active",
        "created_at": "2016-05-05T16:50:16.857Z",
        "updated_at": "2016-06-11T16:05:02.516Z",
        "due_date": "2016-05-24"
      },
      "assignee": null,
      "author": {
        "name": "Tanmai",
        "username": "tanmaig",
        "id": 437892,
        "state": "active",
        "avatar_url": "https://secure.gravatar.com/avatar/150ac2d3aac34bf122fb4aef04916025?s=80&d=identicon",
        "web_url": "https://gitlab.com/u/tanmaig"
      },
      "subscribed": true,
      "user_notes_count": 0,
      "upvotes": 0,
      "downvotes": 0
    },
    {
      "id": 2289735,
      "iid": 23,
      "project_id": 1072407,
      "title": "(no subdomain) option on custom docker",
      "description": "",
      "state": "closed",
      "created_at": "2016-05-24T04:44:59.998Z",
      "updated_at": "2016-06-12T11:34:47.772Z",
      "labels": [],
      "milestone": {
        "id": 61440,
        "iid": 1,
        "project_id": 1072407,
        "title": "danava",
        "description": "",
        "state": "active",
        "created_at": "2016-05-05T16:50:16.857Z",
        "updated_at": "2016-06-11T16:05:02.516Z",
        "due_date": "2016-05-24"
      },
      "assignee": null,
      "author": {
        "name": "Tanmai",
        "username": "tanmaig",
        "id": 437892,
        "state": "active",
        "avatar_url": "https://secure.gravatar.com/avatar/150ac2d3aac34bf122fb4aef04916025?s=80&d=identicon",
        "web_url": "https://gitlab.com/u/tanmaig"
      },
      "subscribed": true,
      "user_notes_count": 0,
      "upvotes": 0,
      "downvotes": 0
    },
    {
      "id": 2281749,
      "iid": 22,
      "project_id": 1072407,
      "title": "Bug in schema view",
      "description": "Refer: http://dashboard.beta.hasura.io/data/schema\r\nClicking on item in second box expands in first box.",
      "state": "closed",
      "created_at": "2016-05-21T08:25:42.433Z",
      "updated_at": "2016-05-23T15:49:27.802Z",
      "labels": [],
      "milestone": {
        "id": 61440,
        "iid": 1,
        "project_id": 1072407,
        "title": "danava",
        "description": "",
        "state": "active",
        "created_at": "2016-05-05T16:50:16.857Z",
        "updated_at": "2016-06-11T16:05:02.516Z",
        "due_date": "2016-05-24"
      },
      "assignee": null,
      "author": {
        "name": "Tanmai",
        "username": "tanmaig",
        "id": 437892,
        "state": "active",
        "avatar_url": "https://secure.gravatar.com/avatar/150ac2d3aac34bf122fb4aef04916025?s=80&d=identicon",
        "web_url": "https://gitlab.com/u/tanmaig"
      },
      "subscribed": true,
      "user_notes_count": 0,
      "upvotes": 0,
      "downvotes": 0
    },
    {
      "id": 2266594,
      "iid": 18,
      "project_id": 1072407,
      "title": "Page titles except for auth",
      "description": "There is no title for any page other than auth. Whatever is the previous title, it stays",
      "state": "opened",
      "created_at": "2016-05-19T09:49:47.320Z",
      "updated_at": "2016-06-11T17:21:32.502Z",
      "labels": [
        "bug"
      ],
      "milestone": {
        "id": 61440,
        "iid": 1,
        "project_id": 1072407,
        "title": "danava",
        "description": "",
        "state": "active",
        "created_at": "2016-05-05T16:50:16.857Z",
        "updated_at": "2016-06-11T16:05:02.516Z",
        "due_date": "2016-05-24"
      },
      "assignee": null,
      "author": {
        "name": "Shahidh K Muhammed",
        "username": "shahidh",
        "id": 437937,
        "state": "active",
        "avatar_url": "https://secure.gravatar.com/avatar/0913331bcf360849ca2acec0612081b2?s=80&d=identicon",
        "web_url": "https://gitlab.com/u/shahidh"
      },
      "subscribed": true,
      "user_notes_count": 0,
      "upvotes": 0,
      "downvotes": 0
    }
  ];
  // res.headers['Content-Type'] = 'application/json';
  res.send(JSON.stringify(a));
});

app.get('/github', (req, res) => {
  console.log('github');
  const a = [
    {
      "url": "https://api.github.com/repos/hasura/support/issues/13",
      "repository_url": "https://api.github.com/repos/hasura/support",
      "labels_url": "https://api.github.com/repos/hasura/support/issues/13/labels{/name}",
      "comments_url": "https://api.github.com/repos/hasura/support/issues/13/comments",
      "events_url": "https://api.github.com/repos/hasura/support/issues/13/events",
      "html_url": "https://github.com/hasura/support/issues/13",
      "id": 159629821,
      "number": 13,
      "title": "Make project name prominent on project console homepage",
      "user": {
        "login": "coco98",
        "id": 131160,
        "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/coco98",
        "html_url": "https://github.com/coco98",
        "followers_url": "https://api.github.com/users/coco98/followers",
        "following_url": "https://api.github.com/users/coco98/following{/other_user}",
        "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
        "organizations_url": "https://api.github.com/users/coco98/orgs",
        "repos_url": "https://api.github.com/users/coco98/repos",
        "events_url": "https://api.github.com/users/coco98/events{/privacy}",
        "received_events_url": "https://api.github.com/users/coco98/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "url": "https://api.github.com/repos/hasura/support/labels/enhancement",
          "name": "enhancement",
          "color": "84b6eb"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/shukra-ui",
          "name": "shukra-ui",
          "color": "f9d0c4"
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "milestone": {
        "url": "https://api.github.com/repos/hasura/support/milestones/1",
        "html_url": "https://github.com/hasura/support/milestones/danava",
        "labels_url": "https://api.github.com/repos/hasura/support/milestones/1/labels",
        "id": 1819870,
        "number": 1,
        "title": "danava",
        "description": "Public beta release\r\nClosed beta production projects",
        "creator": {
          "login": "coco98",
          "id": 131160,
          "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/coco98",
          "html_url": "https://github.com/coco98",
          "followers_url": "https://api.github.com/users/coco98/followers",
          "following_url": "https://api.github.com/users/coco98/following{/other_user}",
          "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
          "organizations_url": "https://api.github.com/users/coco98/orgs",
          "repos_url": "https://api.github.com/users/coco98/repos",
          "events_url": "https://api.github.com/users/coco98/events{/privacy}",
          "received_events_url": "https://api.github.com/users/coco98/received_events",
          "type": "User",
          "site_admin": false
        },
        "open_issues": 6,
        "closed_issues": 0,
        "state": "open",
        "created_at": "2016-06-10T12:23:39Z",
        "updated_at": "2016-06-12T11:45:59Z",
        "due_on": "2016-06-13T18:30:00Z",
        "closed_at": null
      },
      "comments": 0,
      "created_at": "2016-06-10T12:59:39Z",
      "updated_at": "2016-06-12T11:43:45Z",
      "closed_at": null,
      "body": "Also, in step 3 of the project console emphasise the fact that users need to enter their project name"
    },
    {
      "url": "https://api.github.com/repos/hasura/support/issues/10",
      "repository_url": "https://api.github.com/repos/hasura/support",
      "labels_url": "https://api.github.com/repos/hasura/support/issues/10/labels{/name}",
      "comments_url": "https://api.github.com/repos/hasura/support/issues/10/comments",
      "events_url": "https://api.github.com/repos/hasura/support/issues/10/events",
      "html_url": "https://github.com/hasura/support/issues/10",
      "id": 159628429,
      "number": 10,
      "title": "Improvements to 4 step tutorial on landing page",
      "user": {
        "login": "coco98",
        "id": 131160,
        "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/coco98",
        "html_url": "https://github.com/coco98",
        "followers_url": "https://api.github.com/users/coco98/followers",
        "following_url": "https://api.github.com/users/coco98/following{/other_user}",
        "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
        "organizations_url": "https://api.github.com/users/coco98/orgs",
        "repos_url": "https://api.github.com/users/coco98/repos",
        "events_url": "https://api.github.com/users/coco98/events{/privacy}",
        "received_events_url": "https://api.github.com/users/coco98/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "url": "https://api.github.com/repos/hasura/support/labels/enhancement",
          "name": "enhancement",
          "color": "84b6eb"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/shukra-ui",
          "name": "shukra-ui",
          "color": "f9d0c4"
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "milestone": {
        "url": "https://api.github.com/repos/hasura/support/milestones/1",
        "html_url": "https://github.com/hasura/support/milestones/danava",
        "labels_url": "https://api.github.com/repos/hasura/support/milestones/1/labels",
        "id": 1819870,
        "number": 1,
        "title": "danava",
        "description": "Public beta release\r\nClosed beta production projects",
        "creator": {
          "login": "coco98",
          "id": 131160,
          "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/coco98",
          "html_url": "https://github.com/coco98",
          "followers_url": "https://api.github.com/users/coco98/followers",
          "following_url": "https://api.github.com/users/coco98/following{/other_user}",
          "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
          "organizations_url": "https://api.github.com/users/coco98/orgs",
          "repos_url": "https://api.github.com/users/coco98/repos",
          "events_url": "https://api.github.com/users/coco98/events{/privacy}",
          "received_events_url": "https://api.github.com/users/coco98/received_events",
          "type": "User",
          "site_admin": false
        },
        "open_issues": 6,
        "closed_issues": 0,
        "state": "open",
        "created_at": "2016-06-10T12:23:39Z",
        "updated_at": "2016-06-12T11:45:59Z",
        "due_on": "2016-06-13T18:30:00Z",
        "closed_at": null
      },
      "comments": 1,
      "created_at": "2016-06-10T12:51:45Z",
      "updated_at": "2016-06-12T13:59:40Z",
      "closed_at": null,
      "body": "- Convert + to dropdown\r\n- Add video\r\n- Add blog entry"
    },
    {
      "url": "https://api.github.com/repos/hasura/support/issues/9",
      "repository_url": "https://api.github.com/repos/hasura/support",
      "labels_url": "https://api.github.com/repos/hasura/support/issues/9/labels{/name}",
      "comments_url": "https://api.github.com/repos/hasura/support/issues/9/comments",
      "events_url": "https://api.github.com/repos/hasura/support/issues/9/events",
      "html_url": "https://github.com/hasura/support/issues/9",
      "id": 159626513,
      "number": 9,
      "title": "Project name can be added to the Subject in credentials email",
      "user": {
        "login": "praveentfc",
        "id": 7870449,
        "avatar_url": "https://avatars.githubusercontent.com/u/7870449?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/praveentfc",
        "html_url": "https://github.com/praveentfc",
        "followers_url": "https://api.github.com/users/praveentfc/followers",
        "following_url": "https://api.github.com/users/praveentfc/following{/other_user}",
        "gists_url": "https://api.github.com/users/praveentfc/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/praveentfc/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/praveentfc/subscriptions",
        "organizations_url": "https://api.github.com/users/praveentfc/orgs",
        "repos_url": "https://api.github.com/users/praveentfc/repos",
        "events_url": "https://api.github.com/users/praveentfc/events{/privacy}",
        "received_events_url": "https://api.github.com/users/praveentfc/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "url": "https://api.github.com/repos/hasura/support/labels/enhancement",
          "name": "enhancement",
          "color": "84b6eb"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/srishti",
          "name": "srishti",
          "color": "f9d0c4"
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "milestone": {
        "url": "https://api.github.com/repos/hasura/support/milestones/1",
        "html_url": "https://github.com/hasura/support/milestones/danava",
        "labels_url": "https://api.github.com/repos/hasura/support/milestones/1/labels",
        "id": 1819870,
        "number": 1,
        "title": "danava",
        "description": "Public beta release\r\nClosed beta production projects",
        "creator": {
          "login": "coco98",
          "id": 131160,
          "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/coco98",
          "html_url": "https://github.com/coco98",
          "followers_url": "https://api.github.com/users/coco98/followers",
          "following_url": "https://api.github.com/users/coco98/following{/other_user}",
          "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
          "organizations_url": "https://api.github.com/users/coco98/orgs",
          "repos_url": "https://api.github.com/users/coco98/repos",
          "events_url": "https://api.github.com/users/coco98/events{/privacy}",
          "received_events_url": "https://api.github.com/users/coco98/received_events",
          "type": "User",
          "site_admin": false
        },
        "open_issues": 6,
        "closed_issues": 0,
        "state": "open",
        "created_at": "2016-06-10T12:23:39Z",
        "updated_at": "2016-06-12T11:45:59Z",
        "due_on": "2016-06-13T18:30:00Z",
        "closed_at": null
      },
      "comments": 0,
      "created_at": "2016-06-10T12:40:35Z",
      "updated_at": "2016-06-12T11:45:50Z",
      "closed_at": null,
      "body": "Currently the subject in credentials email is Hasura project secrets. When i manage multiple projects, it becomes too generic to refer back to. Project name can be added to the subject for easy reference. "
    },
    {
      "url": "https://api.github.com/repos/hasura/support/issues/7",
      "repository_url": "https://api.github.com/repos/hasura/support",
      "labels_url": "https://api.github.com/repos/hasura/support/issues/7/labels{/name}",
      "comments_url": "https://api.github.com/repos/hasura/support/issues/7/comments",
      "events_url": "https://api.github.com/repos/hasura/support/issues/7/events",
      "html_url": "https://github.com/hasura/support/issues/7",
      "id": 159593467,
      "number": 7,
      "title": "Restart for auth & database don't work [praveen]",
      "user": {
        "login": "coco98",
        "id": 131160,
        "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/coco98",
        "html_url": "https://github.com/coco98",
        "followers_url": "https://api.github.com/users/coco98/followers",
        "following_url": "https://api.github.com/users/coco98/following{/other_user}",
        "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
        "organizations_url": "https://api.github.com/users/coco98/orgs",
        "repos_url": "https://api.github.com/users/coco98/repos",
        "events_url": "https://api.github.com/users/coco98/events{/privacy}",
        "received_events_url": "https://api.github.com/users/coco98/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "url": "https://api.github.com/repos/hasura/support/labels/bug",
          "name": "bug",
          "color": "ee0701"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/shukra-ui",
          "name": "shukra-ui",
          "color": "f9d0c4"
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "milestone": {
        "url": "https://api.github.com/repos/hasura/support/milestones/1",
        "html_url": "https://github.com/hasura/support/milestones/danava",
        "labels_url": "https://api.github.com/repos/hasura/support/milestones/1/labels",
        "id": 1819870,
        "number": 1,
        "title": "danava",
        "description": "Public beta release\r\nClosed beta production projects",
        "creator": {
          "login": "coco98",
          "id": 131160,
          "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/coco98",
          "html_url": "https://github.com/coco98",
          "followers_url": "https://api.github.com/users/coco98/followers",
          "following_url": "https://api.github.com/users/coco98/following{/other_user}",
          "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
          "organizations_url": "https://api.github.com/users/coco98/orgs",
          "repos_url": "https://api.github.com/users/coco98/repos",
          "events_url": "https://api.github.com/users/coco98/events{/privacy}",
          "received_events_url": "https://api.github.com/users/coco98/received_events",
          "type": "User",
          "site_admin": false
        },
        "open_issues": 6,
        "closed_issues": 0,
        "state": "open",
        "created_at": "2016-06-10T12:23:39Z",
        "updated_at": "2016-06-12T11:45:59Z",
        "due_on": "2016-06-13T18:30:00Z",
        "closed_at": null
      },
      "comments": 1,
      "created_at": "2016-06-10T09:20:57Z",
      "updated_at": "2016-06-12T11:44:53Z",
      "closed_at": null,
      "body": ""
    },
    {
      "url": "https://api.github.com/repos/hasura/support/issues/5",
      "repository_url": "https://api.github.com/repos/hasura/support",
      "labels_url": "https://api.github.com/repos/hasura/support/issues/5/labels{/name}",
      "comments_url": "https://api.github.com/repos/hasura/support/issues/5/comments",
      "events_url": "https://api.github.com/repos/hasura/support/issues/5/events",
      "html_url": "https://github.com/hasura/support/issues/5",
      "id": 159592559,
      "number": 5,
      "title": "Auth page | Duplicate headings/links [praveen]",
      "user": {
        "login": "coco98",
        "id": 131160,
        "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/coco98",
        "html_url": "https://github.com/coco98",
        "followers_url": "https://api.github.com/users/coco98/followers",
        "following_url": "https://api.github.com/users/coco98/following{/other_user}",
        "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
        "organizations_url": "https://api.github.com/users/coco98/orgs",
        "repos_url": "https://api.github.com/users/coco98/repos",
        "events_url": "https://api.github.com/users/coco98/events{/privacy}",
        "received_events_url": "https://api.github.com/users/coco98/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "url": "https://api.github.com/repos/hasura/support/labels/bug",
          "name": "bug",
          "color": "ee0701"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/shukra-ui",
          "name": "shukra-ui",
          "color": "f9d0c4"
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "milestone": {
        "url": "https://api.github.com/repos/hasura/support/milestones/1",
        "html_url": "https://github.com/hasura/support/milestones/danava",
        "labels_url": "https://api.github.com/repos/hasura/support/milestones/1/labels",
        "id": 1819870,
        "number": 1,
        "title": "danava",
        "description": "Public beta release\r\nClosed beta production projects",
        "creator": {
          "login": "coco98",
          "id": 131160,
          "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/coco98",
          "html_url": "https://github.com/coco98",
          "followers_url": "https://api.github.com/users/coco98/followers",
          "following_url": "https://api.github.com/users/coco98/following{/other_user}",
          "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
          "organizations_url": "https://api.github.com/users/coco98/orgs",
          "repos_url": "https://api.github.com/users/coco98/repos",
          "events_url": "https://api.github.com/users/coco98/events{/privacy}",
          "received_events_url": "https://api.github.com/users/coco98/received_events",
          "type": "User",
          "site_admin": false
        },
        "open_issues": 6,
        "closed_issues": 0,
        "state": "open",
        "created_at": "2016-06-10T12:23:39Z",
        "updated_at": "2016-06-12T11:45:59Z",
        "due_on": "2016-06-13T18:30:00Z",
        "closed_at": null
      },
      "comments": 2,
      "created_at": "2016-06-10T09:16:22Z",
      "updated_at": "2016-06-12T11:44:53Z",
      "closed_at": null,
      "body": " Below recaptcha. There are two links which don't work."
    },
    {
      "url": "https://api.github.com/repos/hasura/support/issues/1",
      "repository_url": "https://api.github.com/repos/hasura/support",
      "labels_url": "https://api.github.com/repos/hasura/support/issues/1/labels{/name}",
      "comments_url": "https://api.github.com/repos/hasura/support/issues/1/comments",
      "events_url": "https://api.github.com/repos/hasura/support/issues/1/events",
      "html_url": "https://github.com/hasura/support/issues/1",
      "id": 159591307,
      "number": 1,
      "title": "Send project link in credentials email [praveen]",
      "user": {
        "login": "coco98",
        "id": 131160,
        "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/coco98",
        "html_url": "https://github.com/coco98",
        "followers_url": "https://api.github.com/users/coco98/followers",
        "following_url": "https://api.github.com/users/coco98/following{/other_user}",
        "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
        "organizations_url": "https://api.github.com/users/coco98/orgs",
        "repos_url": "https://api.github.com/users/coco98/repos",
        "events_url": "https://api.github.com/users/coco98/events{/privacy}",
        "received_events_url": "https://api.github.com/users/coco98/received_events",
        "type": "User",
        "site_admin": false
      },
      "labels": [
        {
          "url": "https://api.github.com/repos/hasura/support/labels/enhancement",
          "name": "enhancement",
          "color": "84b6eb"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/srishti",
          "name": "srishti",
          "color": "f9d0c4"
        },
        {
          "url": "https://api.github.com/repos/hasura/support/labels/urgent",
          "name": "urgent",
          "color": "d93f0b"
        }
      ],
      "state": "open",
      "locked": false,
      "assignee": null,
      "milestone": {
        "url": "https://api.github.com/repos/hasura/support/milestones/1",
        "html_url": "https://github.com/hasura/support/milestones/danava",
        "labels_url": "https://api.github.com/repos/hasura/support/milestones/1/labels",
        "id": 1819870,
        "number": 1,
        "title": "danava",
        "description": "Public beta release\r\nClosed beta production projects",
        "creator": {
          "login": "coco98",
          "id": 131160,
          "avatar_url": "https://avatars.githubusercontent.com/u/131160?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/coco98",
          "html_url": "https://github.com/coco98",
          "followers_url": "https://api.github.com/users/coco98/followers",
          "following_url": "https://api.github.com/users/coco98/following{/other_user}",
          "gists_url": "https://api.github.com/users/coco98/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/coco98/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/coco98/subscriptions",
          "organizations_url": "https://api.github.com/users/coco98/orgs",
          "repos_url": "https://api.github.com/users/coco98/repos",
          "events_url": "https://api.github.com/users/coco98/events{/privacy}",
          "received_events_url": "https://api.github.com/users/coco98/received_events",
          "type": "User",
          "site_admin": false
        },
        "open_issues": 6,
        "closed_issues": 0,
        "state": "open",
        "created_at": "2016-06-10T12:23:39Z",
        "updated_at": "2016-06-12T11:45:59Z",
        "due_on": "2016-06-13T18:30:00Z",
        "closed_at": null
      },
      "comments": 1,
      "created_at": "2016-06-10T09:09:50Z",
      "updated_at": "2016-06-12T11:45:27Z",
      "closed_at": null,
      "body": "Head over to the dashboard link can be sent over the email too. and the corresponding dashboard username and password can be grouped with the link in the email"
    }
  ];
  // res.headers['Content-Type'] = 'application/json';
  res.send(JSON.stringify(a));
});


app.listen(80, '0.0.0.0');
console.log("Server listening on port 80");
